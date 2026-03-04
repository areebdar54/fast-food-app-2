import { ID, Query } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import realData from "./realData";

type Category = {
    name: string;
    description: string;
};

type Variant = {
    name: string;
    price: number;
};

type MenuItem = {
    name: string;
    description: string;
    image_url: string;
    price: number;
    type?: string;
    category_name: string;
    variants?: Variant[];
    image_slug?: string;
};

type RealDataShape = {
    categories: Category[];
    menu: MenuItem[];
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRateLimitError(e: any) {
    const msg = String(e?.message ?? e ?? "").toLowerCase();
    return msg.includes("rate limit") || msg.includes("too many requests") || e?.code === 429;
}

async function withRetry<T>(fn: () => Promise<T>, label: string, maxRetries = 6): Promise<T> {
    let attempt = 0;
    while (true) {
        try {
            return await fn();
        } catch (e: any) {
            attempt++;
            if (!isRateLimitError(e) || attempt > maxRetries) throw e;

            // exponential backoff: 400ms, 800ms, 1600ms, ...
            const wait = Math.min(8000, 400 * Math.pow(2, attempt - 1));
            console.warn(`⏳ Rate limited on "${label}". Retry ${attempt}/${maxRetries} in ${wait}ms`);
            await sleep(wait);
        }
    }
}


function slugifyName(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/['’]/g, "") // remove apostrophes
        .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric -> hyphen
        .replace(/-+/g, "-") // collapse multiple hyphens
        .replace(/^-|-$/g, ""); // trim hyphens
}

// Lists ALL files in a bucket (handles pagination)
async function listAllBucketFiles(bucketId: string) {
    const all: any[] = [];
    const limit = 100;
    let offset = 0;

    while (true) {
        const res: any = await storage.listFiles(bucketId, [
            Query.limit(limit),
            Query.offset(offset),
        ]);

        const batch = res?.files ?? [];
        all.push(...batch);

        if (batch.length < limit) break;
        offset += limit;
    }

    return all;
}


const data = realData as RealDataShape;

async function clearAll(collectionId: string): Promise<void> {
    while (true) {
        const list = await withRetry(
            () => databases.listDocuments(appwriteConfig.databaseId, collectionId),
            `listDocuments:${collectionId}`
        );

        if (!list.total || list.documents.length === 0) break;

        for (const doc of list.documents) {
            await withRetry(
                () => databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id),
                `deleteDocument:${collectionId}:${doc.$id}`
            );
            await sleep(200);
        }

        if (list.documents.length < list.total) continue;
        break;
    }
}

async function seed(): Promise<void> {
    console.log("🌱 Seeding V2 collections...");

    // 1) Clear V2 only — menu first (it references categories); then categories
    await clearAll(appwriteConfig.menuCollectionId);
    await clearAll(appwriteConfig.categoriesCollectionId);

    // 2) Create categoriesV2 + map name -> id
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
        const doc: any = await withRetry(
            () =>
                databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.categoriesCollectionId,
                    ID.unique(),
                    {
                        name: cat.name.trim(),
                        description: (cat.description ?? "").trim(),
                    }
                ),
            `createCategory:${cat.name}`
        );
        categoryMap[cat.name] = doc.$id;
        await sleep(200);
    }

    // 3) Build image map from Storage bucket
    console.log("🖼️ Loading Storage files...");
    const files = await listAllBucketFiles(appwriteConfig.bucketId);

    // Build slug → ordered list of { number, fileId }.
    // "peri-chicken_01.jpg" → slug "peri-chicken", number 1
    // "fries.jpg"           → slug "fries", number 0
    const filesBySlug = new Map<string, { num: number; fileId: string }[]>();
    for (const f of files) {
        if (!f?.name || !f?.$id) continue;
        const raw = String(f.name);
        const nameWithoutExt = raw.replace(/\.[^.]+$/, "");
        const numMatch = nameWithoutExt.match(/_(\d+)$/);
        const num = numMatch ? parseInt(numMatch[1], 10) : 0;
        const bare = nameWithoutExt.replace(/_\d+$/, "");
        const slug = slugifyName(bare);
        if (!filesBySlug.has(slug)) filesBySlug.set(slug, []);
        filesBySlug.get(slug)!.push({ num, fileId: String(f.$id) });
    }
    // Sort each slug's files by number so _01 comes first
    for (const arr of filesBySlug.values()) arr.sort((a, b) => a.num - b.num);
    console.log(`🖼️ Found ${files.length} files in bucket, ${filesBySlug.size} unique slugs`);

    const fileUrl = (fileId: string) =>
        `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;

    // 4) Create menuV2
    let created = 0;
    let matched = 0;
    for (const item of data.menu) {
        const categoryId = categoryMap[item.category_name];

        if (!categoryId) {
            console.warn(`⚠️ No category match for "${item.category_name}" (item: "${item.name}")`);
            continue;
        }

        const description = (item.description ?? "").trim();
        const variantsValue =
            Array.isArray(item.variants) && item.variants.length > 0
                ? JSON.stringify(item.variants)
                : null;

        const typeValue =
            typeof item.type === "string" && item.type.trim()
                ? item.type.trim()
                : item.category_name === "Drinks"
                  ? "drink"
                  : "food";

        const slug = item.image_slug ?? slugifyName(item.name);
        const slugFiles = filesBySlug.get(slug) ?? [];
        const mainFileId = slugFiles.length > 0 ? slugFiles[0].fileId : null;
        const allFileIds = slugFiles.map((f) => f.fileId);
        const imageUrl = mainFileId ? fileUrl(mainFileId) : item.image_url;

        if (mainFileId) {
            matched++;
        } else {
            console.warn(`🖼️ No image found for "${item.name}" (slug: ${slug})`);
        }

        await withRetry(
            () =>
                databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.menuCollectionId,
                    ID.unique(),
                    {
                        name: item.name.trim(),
                        description: description.length ? description : "",
                        image_url: imageUrl,
                        price: Number(item.price),
                        type: typeValue,
                        variants: variantsValue,
                        categories: categoryId,
                        image_file_id: mainFileId,
                        image_file_ids: allFileIds.length > 0 ? JSON.stringify(allFileIds) : null,
                    }
                ),
            `createMenu:${item.name}`
        );

        await sleep(200);
        created++;
    }

    console.log(`✅ Seed complete. Categories: ${data.categories.length}, Menu items: ${created}, Images matched: ${matched}/${created}`);
}

export default seed;

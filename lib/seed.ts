import * as FileSystem from "expo-file-system/legacy";
import { Image } from "react-native";
import { ID, Permission, Role } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
    name: string;
    description: string;
    image_url: string | number; // Can be a URL string or a local asset (require() result)
    price: number;
    rating: number;
    calories: number;
    protein: number;
    category_name: string;
    customizations: string[]; // list of customization names
}

interface DummyData {
    categories: Category[];
    customizations: Customization[];
    menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
    // Delete in batches to avoid hitting pagination limits
    while (true) {
        const list = await databases.listDocuments(
            appwriteConfig.databaseId,
            collectionId
        );

        if (!list.total || list.documents.length === 0) break;

        await Promise.all(
            list.documents.map((doc) =>
                databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
            )
        );

        // If we deleted fewer than we got, we're done
        if (list.documents.length < list.total) {
            // Loop again to pick up the next page
            continue;
        } else {
            break;
        }
    }
}

async function clearStorage(): Promise<void> {
    // Delete in batches to avoid pagination issues
    while (true) {
        const list = await storage.listFiles(appwriteConfig.bucketId);

        if (!list.total || list.files.length === 0) break;

        await Promise.all(
            list.files.map((file) =>
                storage.deleteFile(appwriteConfig.bucketId, file.$id)
            )
        );

        if (list.files.length < list.total) {
            continue;
        } else {
            break;
        }
    }
}

// Custom error class for image upload failures that should fallback gracefully
class ImageUploadError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ImageUploadError";
    }
}

async function uploadImageToStorage(imageSource: string | number): Promise<string> {
    let localUri: string;
    let ext: string = "png";
    let fileName: string;

    // Check if it's a local asset (number) or URL (string)
    if (typeof imageSource === "number") {
        // Local asset - resolve it using Image.resolveAssetSource
        try {
            const resolved = Image.resolveAssetSource(imageSource);
            if (!resolved || !resolved.uri) {
                throw new ImageUploadError("Failed to resolve local asset URI");
            }

            const resolvedUri = resolved.uri;
            
            // Extract filename and extension from the resolved URI
            const uriParts = resolvedUri.split("/");
            const lastPart = uriParts[uriParts.length - 1] || "";
            fileName = lastPart.split("?")[0] || `menu_${Date.now()}.png`; // Remove query params
            ext = fileName.includes(".") 
                ? fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase()
                : "png";

            // Check if the resolved URI is an HTTP URL (Metro bundler) or a local file path
            if (resolvedUri.startsWith("http://") || resolvedUri.startsWith("https://")) {
                // It's a Metro bundler URL - we need to download it to a local file first
                const cacheDir = (FileSystem as any).cacheDirectory as string | null;
                const docDir = (FileSystem as any).documentDirectory as string | null;
                const baseDir = cacheDir ?? docDir;
                
                if (!baseDir) {
                    throw new ImageUploadError("FileSystem directories not available - cannot download asset");
                }

                // Download the asset from Metro bundler to a local file
                const localPath = `${baseDir}menu_${Date.now()}.${ext}`;
                const download = await FileSystem.downloadAsync(resolvedUri, localPath);
                
                if (download.status !== 200) {
                    throw new ImageUploadError(`Failed to download asset from Metro bundler (${download.status})`);
                }
                
                localUri = download.uri;
            } else {
                // It's already a local file path (file:// or /path)
                localUri = resolvedUri;
            }
        } catch (assetError) {
            throw new ImageUploadError(`Failed to load local asset: ${assetError}`);
        }
    } else {
        // URL string - check if it's a local file path or remote URL
        if (imageSource.startsWith("file://") || imageSource.startsWith("/")) {
            // Already a local file path
            localUri = imageSource;
            fileName = imageSource.split("/").pop() || `menu_${Date.now()}.png`;
            ext = fileName.includes(".") 
                ? fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase()
                : "png";
        } else {
            // Remote URL - download it first
            const cleanUrl = imageSource.split("?")[0];
            ext = cleanUrl.includes(".")
                ? cleanUrl.substring(cleanUrl.lastIndexOf(".") + 1).toLowerCase()
                : "jpg";

            // Access FileSystem properties correctly (they may be null on some platforms)
            const cacheDir = (FileSystem as any).cacheDirectory as string | null;
            const docDir = (FileSystem as any).documentDirectory as string | null;

            const baseDir = cacheDir ?? docDir;
            if (!baseDir) {
                // FileSystem directories not available (common on web or some simulators)
                // Try uploading directly from URL, but if that fails, we'll fallback to original URL
                try {
                    // Determine MIME type based on extension
                    let mimeType = "image/jpeg"; // default
                    if (ext === "png") {
                        mimeType = "image/png";
                    } else if (ext === "jpg" || ext === "jpeg") {
                        mimeType = "image/jpeg";
                    }

                    const fileObj = {
                        name: `menu_${Date.now()}.${ext}`,
                        type: mimeType,
                        uri: imageSource, // Try direct URL
                    };

                    const file = await storage.createFile(
                        appwriteConfig.bucketId,
                        ID.unique(),
                        fileObj as any,
                        [Permission.read(Role.any())]
                    );

                    console.log("✅ Uploaded directly from URL:", file.$id);
                    return storage.getFileViewURL(appwriteConfig.bucketId, file.$id).toString();
                } catch (directError) {
                    // Direct URL upload not supported, will fallback to original URL
                    throw new ImageUploadError("FileSystem unavailable and direct URL upload not supported on this platform");
                }
            }

            // FileSystem is available, download the remote image
            const localPath = `${baseDir}menu_${Date.now()}.${ext}`;
            const download = await FileSystem.downloadAsync(imageSource, localPath);

            if (download.status !== 200) {
                throw new ImageUploadError(`Image download failed (${download.status})`);
            }

            localUri = download.uri;
            fileName = `menu_${Date.now()}.${ext}`;
        }
    }

    // Now upload the local file to Appwrite Storage
    try {
        // Read file info to get size (using legacy API)
        const info = await FileSystem.getInfoAsync(localUri);
        if (!info || !info.exists) {
            throw new ImageUploadError("File missing");
        }

        // Upload to Appwrite Storage
        // Determine MIME type based on extension
        let mimeType = "image/jpeg"; // default
        if (ext === "png") {
            mimeType = "image/png";
        } else if (ext === "jpg" || ext === "jpeg") {
            mimeType = "image/jpeg";
        }

        const fileObj = {
            name: fileName,
            type: mimeType,
            size: info.size ?? 0,
            uri: localUri, // local file:// uri
        };

        const file = await storage.createFile(
            appwriteConfig.bucketId,
            ID.unique(),
            fileObj as any,
            [Permission.read(Role.any())]
        );

        console.log("✅ Uploaded to storage:", file.$id);
        return storage.getFileViewURL(appwriteConfig.bucketId, file.$id).toString();
    } catch (error) {
        if (error instanceof ImageUploadError) {
            throw error;
        }
        throw new ImageUploadError(`Upload failed: ${error}`);
    }
}

async function seed(): Promise<void> {
    console.log("🌱 Starting full database seed...");

    // 1. Clear all existing data
    await clearAll(appwriteConfig.categoriesCollectionId);
    await clearAll(appwriteConfig.customizationsCollectionId);
    await clearAll(appwriteConfig.menuCollectionId);
    await clearAll(appwriteConfig.menuCustomizationsCollectionId);
    await clearStorage();

    // Counters for logging
    let categoriesCreated = 0;
    let customizationsCreated = 0;
    let menuItemsCreated = 0;
    let menuCustomizationsCreated = 0;

    // 2. Create Categories
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
        try {
            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.categoriesCollectionId,
                ID.unique(),
                cat
            );
            categoryMap[cat.name] = doc.$id;
            categoriesCreated++;
        } catch (error) {
            console.error(`❌ Failed to create category "${cat.name}"`, error);
        }
    }

    // 3. Create Customizations
    const customizationMap: Record<string, string> = {};
    for (const cus of data.customizations) {
        try {
            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.customizationsCollectionId,
                ID.unique(),
                {
                    name: cus.name,
                    price: cus.price,
                    type: cus.type,
                }
            );
            customizationMap[cus.name] = doc.$id;
            customizationsCreated++;
        } catch (error) {
            console.error(`❌ Failed to create customization "${cus.name}"`, error);
        }
    }

    // 4. Create Menu Items
    const menuMap: Record<string, string> = {};
    for (const item of data.menu) {
        console.log("🍔 Seeding item:", item.name);

        try {
            // Try to upload image to Appwrite Storage
            let finalImageUrl: string;
            
            // If image_url is a number (local asset), we MUST upload it - no fallback
            if (typeof item.image_url === "number") {
                try {
                    finalImageUrl = await uploadImageToStorage(item.image_url);
                } catch (imageError) {
                    console.error(
                        `❌ Failed to upload local image for "${item.name}". Cannot use local asset directly in database.`,
                        imageError
                    );
                    // Skip this item - we can't store a number in the URL field
                    continue;
                }
            } else {
                // It's a URL string - try to upload, but fallback to original URL if it fails
                try {
                    finalImageUrl = await uploadImageToStorage(item.image_url);
                } catch (imageError) {
                    // For URL strings, we can fallback to the original URL
                    if (imageError instanceof ImageUploadError) {
                        finalImageUrl = item.image_url; // Use original URL string
                    } else {
                        console.warn(`⚠️ Image upload failed for "${item.name}", using original URL`);
                        finalImageUrl = item.image_url; // Use original URL string
                    }
                }
            }

            // Validate that finalImageUrl is a valid string URL
            if (typeof finalImageUrl !== "string" || finalImageUrl.length === 0) {
                console.error(`❌ Invalid image URL for "${item.name}", skipping item`);
                continue;
            }

            // Appwrite URL field has a 2000 character limit
            if (finalImageUrl.length > 2000) {
                console.error(
                    `❌ Image URL too long (${finalImageUrl.length} chars) for "${item.name}", skipping item`
                );
                continue;
            }

            const categoryId = categoryMap[item.category_name];
            if (!categoryId) {
                console.warn(
                    `⚠️ No category found for "${item.category_name}" (item "${item.name}"), skipping item`
                );
                continue;
            }

            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.menuCollectionId,
                ID.unique(),
                {
                    name: item.name,
                    description: item.description,
                    image_url: finalImageUrl,
                    price: item.price,
                    rating: item.rating,
                    calories: item.calories,
                    protein: item.protein,
                    categories: categoryId,
                }
            );

            menuMap[item.name] = doc.$id;
            menuItemsCreated++;

            // 5. Create menu_customizations
            for (const cusName of item.customizations) {
                const customizationId = customizationMap[cusName];
                if (!customizationId) {
                    console.warn(
                        `⚠️ No customization found for "${cusName}" on item "${item.name}", skipping relation`
                    );
                    continue;
                }

                try {
                    await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.menuCustomizationsCollectionId,
                        ID.unique(),
                        {
                            menu: doc.$id,
                            customizations: customizationId,
                        }
                    );
                    menuCustomizationsCreated++;
                } catch (relationError) {
                    console.error(
                        `❌ Failed to create menu_customization for "${item.name}" and "${cusName}"`,
                        relationError
                    );
                }
            }
        } catch (itemError) {
            console.error(`❌ Failed to seed menu item "${item.name}"`, itemError);
        }
    }

    console.log(
        `✅ Seeding complete. Categories: ${categoriesCreated}, Customizations: ${customizationsCreated}, Menu items: ${menuItemsCreated}, Menu customizations: ${menuCustomizationsCreated}`
    );
}

export default seed;
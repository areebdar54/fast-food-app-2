import {Account, Avatars, Client, Databases, ID, Query, Storage} from "react-native-appwrite";
import {CreateUserParams, GetMenuParams, SignInParams} from "@/type";

export const appwriteConfig =  {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    platform: "com.jsm.foodordering",
    databaseId: "695bce55001aa5831c8b",
    bucketId: "6962d5ba001edd15a555",
    userCollectionId: 'users',
    categoriesCollectionId: 'categories',
    menuCollectionId: 'menu',
    customizationsCollectionId: 'customizations',
    menuCustomizationsCollectionId: 'menu_customization',
}

// chatgpt check endpoint status, can delete later when everything works
console.log("APPWRITE ENV CHECK", {
    endpoint: appwriteConfig.endpoint,
    projectId: appwriteConfig.projectId,
});


export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({ email, password, name }: CreateUserParams) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name);
        if (!newAccount) throw Error;

        await signIn({ email, password });

        const avatarUrl = avatars.getInitialsURL(name);

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            { email, name, accountId: newAccount.$id, avatar: avatarUrl }
        );
    } catch (e) {
         throw new Error(e as string);
    }

}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        const session = await account.createEmailPasswordSession({ email, password });
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const getMenu = async ({ category, query }: GetMenuParams) => {
    try {
        const queries: string[] = [];

        if(category) queries.push(Query.equal('categories', category));
        if(query) queries.push(Query.search('name', query));

        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,
        )

        return menus.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
        )

        return categories.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}


export const signOut = async () => {
    try {
        // deletes the current session
        await account.deleteSession("current");
    } catch (e) {
        // If there's no active session, Appwrite may throw; treat as logged out.
        console.warn("signOut error:", e);
    }
};

export const getMenuItemById = async (id: string) => {
    try {
        return await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            id
        );
    } catch (e) {
        throw new Error(e as string);
    }
};

type CustomizationDoc = {
    $id: string;
    name: string;
    price: number;
    type: string;
};

export const getMenuCustomizations = async (menuId: string): Promise<CustomizationDoc[]> => {
    try {
        // menu_customization collection stores relations: { menu: <menuId>, customizations: <customizationId | doc> }
        const rels = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCustomizationsCollectionId,
            [Query.equal("menu", menuId)]
        );

        const maybeDocs = rels.documents
            .map((d: any) => d.customizations)
            .filter(Boolean);

        // If relations are expanded, we already have docs
        const expanded = maybeDocs.filter((c: any) => typeof c === "object" && c.$id);
        if (expanded.length > 0) {
            return expanded.map((c: any) => ({
                $id: c.$id,
                name: c.name,
                price: Number(c.price ?? 0),
                type: c.type ?? "custom",
            }));
        }

        // Otherwise we only have ids, so fetch the customization documents
        const ids = maybeDocs.filter((c: any) => typeof c === "string") as string[];
        if (ids.length === 0) return [];

        const customizationDocs = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.customizationsCollectionId,
            [Query.equal("$id", ids)]
        );

        return customizationDocs.documents.map((c: any) => ({
            $id: c.$id,
            name: c.name,
            price: Number(c.price ?? 0),
            type: c.type ?? "custom",
        }));
    } catch (e) {
        console.error("getMenuCustomizations error:", e);
        return [];
    }
};

export const updateUserDocument = async (
    userDocumentId: string,
    data: Partial<{ name: string; phone: string; address: string; avatar: string; }>
) => {
    try {
        return await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userDocumentId,
            data
        );
    } catch (e) {
        throw new Error(e as string);
    }
};

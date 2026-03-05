import "../globals.css"
import {FlatList, Image, ImageSourcePropType, Pressable, Text, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {images} from "@/constants"
import {Fragment, useMemo} from "react";
import cn from "clsx"
import CartButton from "@/components/CartButton";
import useAuthStore from "@/store/auth.store";
import useAppwrite from "@/lib/useAppwrite";
import {getCategories, getMenu} from "@/lib/appwrite";
import {useRouter} from "expo-router";

import periChickenBanner from "@/assets/images/peri-chicken-banner.jpg";
import burgerBanner from "@/assets/images/burger-banner.jpg";
import selectsBanner from "@/assets/images/selects-banner.jpg";

const EXCLUDED_CATEGORIES = ["Sides", "Drinks"];

const LOCAL_BANNER_IMAGES: Record<string, ImageSourcePropType> = {
    "Peri Collection": periChickenBanner,
    "Burgers": burgerBanner,
    "Selects": selectsBanner,
};

const BANNER_TITLES: Record<string, string> = {
    "Peri Collection": "PERI PERI",
    "Burgers": "BURGERS",
    "Wraps": "WRAPS",
    "Pittas": "PITTAS",
    "Fried Collection": "FRIED",
    "Selects": "SELECTS",
    "MunchBox": "MUNCHBOX",
    "Veg Collection": "VEGGIE",
    "Kids Collection": "KIDS MEALS",
    "Platters": "PLATTERS",
    "Desserts": "DESSERTS",
};

const BANNER_COLORS = [
    "#D33B0D",
    "#DF5A0C",
    "#084137",
    "#EB920C",
    "#8B1A1A",
    "#2E6B4F",
    "#C35600",
    "#1B4D6E",
    "#6B2D5B",
    "#3A7D44",
    "#B84700",
];

type BannerItem = {
    id: string;
    title: string;
    imageUri: string;
    localImage?: ImageSourcePropType;
    color: string;
    categoryId: string;
};

export default function Index() {
    const router = useRouter();
    const { user } = useAuthStore();

    const { data: categories } = useAppwrite({ fn: getCategories });
    const { data: menuItems } = useAppwrite({ fn: getMenu, params: { category: "", query: "" } });

    const banners: BannerItem[] = useMemo(() => {
        if (!categories || !menuItems) return [];

        const itemsByCategory = new Map<string, any>();
        for (const item of menuItems) {
            const catId = item.categories?.$id ?? item.categories;
            if (catId && !itemsByCategory.has(catId)) {
                itemsByCategory.set(catId, item);
            }
        }

        return categories
            .filter((cat: any) => !EXCLUDED_CATEGORIES.includes(cat.name))
            .map((cat: any, index: number) => {
                const representative = itemsByCategory.get(cat.$id);
                return {
                    id: cat.$id,
                    title: BANNER_TITLES[cat.name] ?? cat.name.toUpperCase(),
                    imageUri: representative?.image_url ?? "",
                    localImage: LOCAL_BANNER_IMAGES[cat.name],
                    color: BANNER_COLORS[index % BANNER_COLORS.length],
                    categoryId: cat.$id,
                };
            });
    }, [categories, menuItems]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <FlatList
                data={banners}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => {
                    const isEven = index % 2 === 0;

                    return (
                        <Pressable
                            className={cn("offer-card", isEven ? "flex-row-reverse" : "flex-row")}
                            style={{ backgroundColor: item.color }}
                            onPress={() =>
                                router.push({
                                    pathname: "/(tabs)/order",
                                    params: { category: item.categoryId },
                                })
                            }
                        >
                            {() => (
                                <Fragment>
                                    <View className="h-full w-1/2">
                                        {item.localImage ? (
                                            <Image
                                                source={item.localImage}
                                                className="size-full"
                                                resizeMode="contain"
                                            />
                                        ) : item.imageUri ? (
                                            <Image
                                                source={{ uri: item.imageUri }}
                                                className="size-full"
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <View className="size-full" />
                                        )}
                                    </View>

                                    <View className={cn("offer-card__info", isEven ? "pl-10" : "pr-10")}>
                                        <Text
                                            className="h1-bold text-white leading-tight"
                                            numberOfLines={1}
                                            adjustsFontSizeToFit
                                            minimumFontScale={0.6}
                                        >
                                            {item.title}
                                        </Text>
                                        <Image
                                            source={images.arrowRight}
                                            className="size-10"
                                            resizeMode="contain"
                                            tintColor="#ffffff"
                                        />
                                    </View>
                                </Fragment>
                            )}
                        </Pressable>
                    );
                }}
                contentContainerClassName="pb-28 px-5"
                ListHeaderComponent={() => (
                    <View className="flex-between flex-row w-full my-5 px-5">
                        <View className="flex-start">
                            <Text className="small-bold text-primary">DELIVER TO</Text>
                            <TouchableOpacity className="flex-center flex-row gap-x-1 mt-0.5">
                                <Text className="paragraph-bold text-dark-100">UK</Text>
                                <Image source={images.arrowDown} className="size-3" resizeMode="contain" />
                            </TouchableOpacity>
                        </View>

                        <CartButton />
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

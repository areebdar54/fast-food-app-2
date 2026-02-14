import {Text, Button, FlatList, View} from 'react-native'
import {SafeAreaView} from "react-native-safe-area-context";
import seed from "@/lib/seed";
import useAppwrite from "@/lib/useAppwrite";
import {getCategories, getMenu} from "@/lib/appwrite";
import {useLocalSearchParams} from "expo-router";
import {useEffect} from "react";
import CartButton from "@/components/CartButton";
import cn from "clsx";
import MenuCard from "@/components/MenuCard";
import SearchBar from "@/components/SearchBar";
import Filter from "@/components/Filter";
import {Category, MenuItem} from "@/type";

const Search = () => {

    const { category, query } = useLocalSearchParams<{query: string; category: string}>()

    //fetches menu items
    const { data, refetch, loading } = useAppwrite({ fn: getMenu, params: { category, query, limit: 6, }});
    //fetches categories
    const { data: categories } = useAppwrite({ fn: getCategories });

    useEffect(() => {
        refetch({ category, query, limit: 6 });
    }, [category, query]);

    return (
        <SafeAreaView className="bg-white h-full">
            <FlatList
                data={data ?? []}
                keyExtractor={item => item.$id}
                renderItem={({ item, index }) => {
                    const isFirstRightColItem = index % 2 === 0;
                    return (
                        <View className={cn("flex-1 max-w-[48%]", !isFirstRightColItem ? 'mt-10': 'mt-0')}>
                            <MenuCard item={item as unknown as MenuItem} />
                        </View>
                    );
                }}
                numColumns={2}
                columnWrapperClassName="gap-7"
                contentContainerClassName="gap-7 px-5 pb-32"
                ListHeaderComponent={({item}) => (
                    <View className="my-5 gap-5">
                        <View className="flex-between flex-row w-full">
                            <View className="flex-start">
                                <Text className="small-bold uppercase text-primary">Search</Text>
                                <View className="flex-start flex-row gap-x-1 mt-0.5">
                                    <Text className="paragraph-semibold text-dark-100">Find your favourite food</Text>
                                </View>
                            </View>

                            <CartButton />
                        </View>

                        <SearchBar />

                        <Filter categories={(categories ?? []) as unknown as Category[]} />

                    </View>
                )}
                ListEmptyComponent={() => !loading && <Text>No Results</Text>}
            />

        </SafeAreaView>
    )
}
export default Search

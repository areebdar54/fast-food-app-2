import {TouchableOpacity, Image, Text, Platform} from 'react-native'
import { useRouter } from "expo-router";
import {MenuItem} from "@/type";

const MenuCard = ({ item: { $id, image_url, name, price }}: { item: MenuItem}) => {
    const router = useRouter();
    const imageUrl = image_url;

    return (
        <TouchableOpacity
            className="menu-card"
            onPress={() => router.push(`/details/${$id}`)}
            style={Platform.OS === 'android' ? { elevation: 10, shadowColor: '#878787'}: {}}
        >
            <Image source={{ uri: imageUrl }} className="size-32 absolute -top-10" resizeMode="contain"/>
            <Text className="text-center base-bold text-dark-100 mb-2" numberOfLines={1}>{name}</Text>
            <Text className="body-regular text-gray-200">From £{price}</Text>
        </TouchableOpacity>
    )
}
export default MenuCard

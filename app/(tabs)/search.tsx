import {Text, Button} from 'react-native'
import {SafeAreaView} from "react-native-safe-area-context";
import seed from "@/lib/seed";

const Search = () => {
    return (
        <SafeAreaView>
            <Text>Search</Text>

            <Button
                title="Seed"
                onPress={async () => {
                    try {
                        console.log("🌱 Seeding started...");
                        await seed();
                        console.log("✅ Seeded successfully");
                    } catch (error) {
                        console.error("❌ Failed to seed the database:", error);
                    }
                }}
            />


        </SafeAreaView>
    )
}
export default Search

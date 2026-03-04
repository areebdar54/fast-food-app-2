import "../globals.css";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import seed from "@/lib/seed";
import { Alert, Pressable } from "react-native";

import useAuthStore from "@/store/auth.store";
import { images } from "@/constants";
import { signOut } from "@/lib/appwrite";

const Row = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <View className="flex-row items-center bg-white rounded-2xl px-4 py-4 border border-gray-100 mb-3">
    <View className="size-10 rounded-full bg-gray-100 items-center justify-center mr-3">
      <Image source={icon} className="size-5" resizeMode="contain" tintColor="#FE8C00" />
    </View>

    <View className="flex-1">
      <Text className="small-bold text-gray-200">{label}</Text>
      <Text className="paragraph-bold text-dark-100 mt-1">{value}</Text>
    </View>
  </View>
);

export default function Profile() {
  const router = useRouter();
  const { user, setIsAuthenticated, setUser } = useAuthStore();

  const phone = (user as any)?.phone ?? "";
  const address = (user as any)?.address ?? "";

  const onLogout = async () => {
    await signOut();
    setUser(null);
    setIsAuthenticated(false);
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={images.arrowBack} className="size-6" resizeMode="contain" />
        </TouchableOpacity>

        <Text className="absolute left-0 right-0 text-center h3-bold text-dark-100">
          Profile
        </Text>
      </View>


      <ScrollView contentContainerClassName="px-5 pb-32">
        {/* Avatar */}
        <View className="items-center mt-2 mb-6">
          <View className="relative">
            <Image
              source={{ uri: (user as any)?.avatar || "" }}
              className="size-28 rounded-full bg-gray-100"
              resizeMode="cover"
            />

            <TouchableOpacity
              className="absolute bottom-1 right-1 size-9 rounded-full bg-primary items-center justify-center"
              onPress={() => router.push("/edit-profile")}
            >
              <Image source={images.pencil} className="size-4" resizeMode="contain" tintColor="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Row icon={images.user} label="Full Name" value={(user as any)?.name ?? "-"} />
        <Row icon={images.envelope} label="Email" value={(user as any)?.email ?? "-"} />
        <Row icon={images.phone} label="Phone number" value={phone || "-"} />
        <Row icon={images.location} label="Address" value={address || "-"} />

        <TouchableOpacity
          className="border border-primary rounded-full py-4 mt-4"
          onPress={() => router.push("/edit-profile")}
        >
          <Text className="paragraph-bold text-primary text-center">Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity className="border border-red-400 rounded-full py-4 mt-3" onPress={onLogout}>
          <View className="flex-row items-center justify-center gap-x-2">
            <Image source={images.logout} className="size-5" resizeMode="contain" tintColor="#EF4444" />
            <Text className="paragraph-bold text-red-500 text-center">Logout</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {__DEV__ && (
          <Pressable
              onPress={() =>
                  Alert.alert(
                      "Seed Database",
                      "This will CLEAR menuV2 + categoriesV2 and reseed from realData. Continue?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Seed",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              await seed();
                              Alert.alert("Done", "Seeding complete.");
                            } catch (e: any) {
                              Alert.alert("Seed failed", e?.message ?? String(e));
                            }
                          },
                        },
                      ]
                  )
              }
              style={{ marginTop: 16, padding: 12, borderRadius: 10, borderWidth: 1 }}
          >
            <Text>DEV: Seed Database</Text>
          </Pressable>
      )}

    </SafeAreaView>
  );
}

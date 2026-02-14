import "./globals.css";
import { useState } from "react";
import { Alert, Image, ScrollView, TouchableOpacity, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import useAuthStore from "@/store/auth.store";
import { images } from "@/constants";
import { updateUserDocument } from "@/lib/appwrite";

export default function EditProfile() {
  const router = useRouter();
  const { user, fetchAuthenticatedUser } = useAuthStore();

  const [name, setName] = useState<string>((user as any)?.name ?? "");
  const [phone, setPhone] = useState<string>((user as any)?.phone ?? "");
  const [address, setAddress] = useState<string>((user as any)?.address ?? "");

  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!user?.$id) return;

    try {
      setSaving(true);

      await updateUserDocument(user.$id, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      await fetchAuthenticatedUser();

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/profile");
      }


    } catch (e: any) {
      console.log("update profile error:", e);

      // Very common issue: the attribute doesn't exist in Appwrite collection
      Alert.alert(
        "Couldn't save profile",
        "If you're using Appwrite, make sure your users collection has attributes: phone, address1, address2 (all string)."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={images.arrowBack} className="size-6" resizeMode="contain" />
        </TouchableOpacity>

        <Text className="h3-bold text-dark-100">Edit Profile</Text>

        <View className="size-6" />
      </View>

      <ScrollView contentContainerClassName="px-5 pb-10">
        <CustomInput label="Full Name" placeholder="Your name" value={name} onChangeText={setName} />
        <View className="h-4" />
        <CustomInput
          label="Phone Number"
          placeholder="e.g. +44 7..."
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <View className="h-4" />
        <CustomInput
            label="Address"
            placeholder="Your address"
            value={address}
            onChangeText={setAddress}
        />


        <View className="h-8" />
        <CustomButton title="Save Changes" onPress={onSave} isLoading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

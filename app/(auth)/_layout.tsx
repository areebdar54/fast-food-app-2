import {
    View,
    ScrollView,
    Dimensions,
    ImageBackground,
    Image,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import React from "react";
import { Redirect, Slot } from "expo-router";
import { images } from "@/constants";
import useAuthStore from "@/store/auth.store";

export default function _Layout() {
    const { isAuthenticated } = useAuthStore();

    if(isAuthenticated) return <Redirect href="/" />

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView className="bg-white" keyboardShouldPersistTaps="handled">
                <View
                    className="w-full relative overflow-visible"
                    style={{ height: Dimensions.get("screen").height / 2.25 }}
                >
                    <ImageBackground
                        source={images.loginGraphic}
                        className="size-full rounded-b-lg"
                        resizeMode="stretch"
                    />
                    <Image
                        source={images.logo}
                        className="absolute self-center bottom-16 z-10 w-48 h-48"
                        resizeMode="contain"
                    />
                </View>

                <Slot />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

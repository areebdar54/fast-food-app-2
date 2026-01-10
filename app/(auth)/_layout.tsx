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

export default function _Layout() {
    const isAuthenticated = true; // test

    // If logged in, never show auth screens
    if (isAuthenticated) return <Redirect href="/(tabs)" />;

    // Otherwise show the auth stack (sign-in / sign-up)
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

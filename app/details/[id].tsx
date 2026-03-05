import "../globals.css";

import { JSX, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { images } from "@/constants";
import { appwriteConfig } from "@/lib/appwrite";
import { getMenuItemById } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.store";
import { getOptionGroupsForMenu, type OptionGroup } from "@/lib/optionGroups";

const SCREEN_WIDTH = Dimensions.get("window").width;
const IMAGE_WIDTH = SCREEN_WIDTH - 40; // px-5 on each side


/** -----------------------------
 * Fixed “Meal sides” list (your concept)
 * ------------------------------*/
function buildFileUrl(fileId: string): string {
  return `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
}

function parseGalleryUrls(menu: any): string[] {
  if (menu?.image_file_ids) {
    try {
      const ids: string[] = JSON.parse(menu.image_file_ids);
      if (Array.isArray(ids) && ids.length > 0) return ids.map(buildFileUrl);
    } catch {}
  }
  if (menu?.image_url) return [menu.image_url];
  return [];
}

export default function Details(): JSX.Element {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { addItem } = useCartStore();

  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // selections
  const [selectedSingles, setSelectedSingles] = useState<Record<string, string>>({});
  const [selectedMultis, setSelectedMultis] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        const item = await getMenuItemById(String(id));
        if (!mounted) return;

        setMenu(item);

        // reset selections when switching to a new item
        setQty(1);
        setSelectedSingles({});
        setSelectedMultis({});
      } catch (e) {
        console.log("Details load error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [id]);

  const optionGroups: OptionGroup[] = useMemo(() => {
    if (!menu) return [];
    return getOptionGroupsForMenu(menu);
  }, [menu]);

  const isGroupVisible = (group: OptionGroup) => {
    if (!group.dependsOn) return true;
    const current = selectedSingles[group.dependsOn.groupId];
    if ("optionIds" in group.dependsOn) return group.dependsOn.optionIds.includes(current);
    return current === group.dependsOn.optionId;
  };

  const setSingle = (groupId: string, optionId: string) => {
    setSelectedSingles((prev) => {
      const next = { ...prev, [groupId]: optionId };

      if (groupId === "meal" && optionId === "meal_no") {
        setSelectedMultis((mPrev) => {
          const mNext = { ...mPrev };
          delete mNext["meal_sides"];
          return mNext;
        });
      }

      // Clear dependent single groups when parent changes (e.g. Munchbox burger flavour/seasoning)
      const dependents = optionGroups.filter(
        (g) => g.dependsOn?.groupId === groupId && g.type === "single"
      );
      for (const g of dependents) delete next[g.id];

      return next;
    });
  };

  const toggleMulti = (groupId: string, optionId: string, maxSelect: number) => {
    setSelectedMultis((prev) => {
      const current = prev[groupId] ?? [];
      const exists = current.includes(optionId);

      if (exists) {
        return { ...prev, [groupId]: current.filter((x) => x !== optionId) };
      }

      // enforce maxSelect
      if (current.length >= maxSelect) {
        return prev; // ignore extra taps
      }

      return { ...prev, [groupId]: [...current, optionId] };
    });
  };

  const optionsTotal = useMemo(() => {
    if (!menu) return 0;

    let sum = 0;

    // singles
    for (const g of optionGroups) {
      if (g.type !== "single") continue;
      if (!isGroupVisible(g)) continue;

      const selectedId = selectedSingles[g.id];
      if (!selectedId) continue;

      const opt = g.options.find((o) => o.id === selectedId);
      sum += Number(opt?.price ?? 0);
    }

    // multis
    for (const g of optionGroups) {
      if (g.type !== "multi") continue;
      if (!isGroupVisible(g)) continue;

      const selectedIds = selectedMultis[g.id] ?? [];
      for (const sid of selectedIds) {
        const opt = g.options.find((o) => o.id === sid);
        sum += Number(opt?.price ?? 0);
      }
    }

    return sum;
  }, [menu, optionGroups, selectedSingles, selectedMultis]);

  const basePrice = Number(menu?.price ?? 0);
  const total = useMemo(() => (basePrice + optionsTotal) * qty, [basePrice, optionsTotal, qty]);

  // Minimal “required validation” for now (UI-first)
  const canAddToCart = useMemo(() => {
    if (!menu) return false;

    for (const g of optionGroups) {
      if (!isGroupVisible(g)) continue;
      if (!g.required) continue;

      if (g.type === "single") {
        if (!selectedSingles[g.id]) return false;
      } else {
        const selected = selectedMultis[g.id] ?? [];
        if (selected.length === 0) return false;
      }
    }

    return true;
  }, [menu, optionGroups, selectedSingles, selectedMultis]);

  const addToCart = () => {
    if (!menu) return;
    if (!canAddToCart) return;

    const customizations: { id: string; name: string; price: number; type: string }[] = [];
    for (const g of optionGroups) {
      if (!isGroupVisible(g)) continue;
      if (g.type === "single") {
        const optId = selectedSingles[g.id];
        if (!optId) continue;
        const opt = g.options.find((o) => o.id === optId);
        if (opt)
          customizations.push({ id: opt.id, name: opt.label, price: Number(opt.price ?? 0), type: g.id });
      } else {
        const ids = selectedMultis[g.id] ?? [];
        for (const optId of ids) {
          const opt = g.options.find((o) => o.id === optId);
          if (opt)
            customizations.push({ id: opt.id, name: opt.label, price: Number(opt.price ?? 0), type: g.id });
        }
      }
    }

    const payload = {
      id: menu.$id,
      name: menu.name,
      price: Number(menu.price ?? 0),
      image_url: menu.image_url,
      customizations,
    };

    for (let i = 0; i < qty; i++) addItem(payload);

    router.back();
  };

  const RadioRow = ({
                      label,
                      selected,
                      price,
                      onPress,
                    }: {
    label: string;
    selected: boolean;
    price?: number;
    onPress: () => void;
  }) => (
      <TouchableOpacity onPress={onPress} className="flex-row items-center justify-between border border-gray-100 rounded-xl px-4 py-4 mt-3">
        <View className="flex-row items-center">
          <View className={`w-6 h-6 rounded-full border ${selected ? "border-primary" : "border-gray-200"} items-center justify-center`}>
            {selected ? <View className="w-3.5 h-3.5 rounded-full bg-primary" /> : null}
          </View>
          <Text className="paragraph-regular text-dark-100 ml-3">{label}</Text>
        </View>

        {Number(price ?? 0) > 0 ? (
            <Text className="paragraph-regular text-gray-200">+£{Number(price ?? 0).toFixed(2)}</Text>
        ) : (
            <View />
        )}
      </TouchableOpacity>
  );

  const CheckRow = ({
                      label,
                      selected,
                      disabled,
                      onPress,
                    }: {
    label: string;
    selected: boolean;
    disabled: boolean;
    onPress: () => void;
  }) => (
      <TouchableOpacity
          onPress={onPress}
          disabled={disabled}
          className={`flex-row items-center justify-between border rounded-xl px-4 py-4 mt-3 ${
              disabled && !selected ? "border-gray-100 opacity-50" : "border-gray-100"
          }`}
      >
        <View className="flex-row items-center">
          <View className={`w-6 h-6 rounded-md border ${selected ? "border-primary bg-primary" : "border-gray-200"} items-center justify-center`}>
            {selected ? <Text className="text-white font-bold">✓</Text> : null}
          </View>
          <Text className="paragraph-regular text-dark-100 ml-3">{label}</Text>
        </View>
      </TouchableOpacity>
  );

  if (loading) {
    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center">
          <ActivityIndicator />
        </SafeAreaView>
    );
  }

  if (!menu) {
    return (
        <SafeAreaView className="flex-1 bg-white px-5">
          <View className="flex-row items-center justify-between px-5 py-4">
            <TouchableOpacity onPress={() => router.back()}>
              <Image source={images.arrowBack} className="size-6" resizeMode="contain" />
            </TouchableOpacity>
          </View>

          <Text className="h2-bold text-dark-100">Item not found</Text>
        </SafeAreaView>
    );
  }

  return (
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={images.arrowBack} className="size-6" resizeMode="contain" />
          </TouchableOpacity>
          <View />
        </View>

        <ScrollView contentContainerClassName="pb-40 px-5">
          {/* Title */}
          <Text className="h1-bold text-dark-100 text-center mt-2">{menu.name}</Text>

          {/* Image gallery */}
          {(() => {
            const galleryUrls = parseGalleryUrls(menu);
            if (galleryUrls.length <= 1) {
              return (
                <View className="mt-6 items-center">
                  <Image
                    source={{ uri: galleryUrls[0] ?? menu.image_url }}
                    className="w-full h-64 rounded-2xl"
                    resizeMode="contain"
                  />
                </View>
              );
            }
            return (
              <View className="mt-6">
                <FlatList
                  data={galleryUrls}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(_, i) => String(i)}
                  onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / IMAGE_WIDTH);
                    setActiveImageIndex(idx);
                  }}
                  renderItem={({ item: uri }) => (
                    <Image
                      source={{ uri }}
                      style={{ width: IMAGE_WIDTH, height: 256 }}
                      className="rounded-2xl"
                      resizeMode="contain"
                    />
                  )}
                />
                <View className="flex-row justify-center mt-3">
                  {galleryUrls.map((_, i) => (
                    <View
                      key={i}
                      className={`w-2 h-2 rounded-full mx-1 ${
                        i === activeImageIndex ? "bg-primary" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </View>
              </View>
            );
          })()}

          {/* Price */}
          <Text className="h2-bold text-primary text-center mt-6">
            £{Number(menu.price ?? 0).toFixed(2)}
          </Text>

          {/* Description */}
          <Text className="paragraph-regular text-gray-200 mt-4 leading-6 text-center">
            {menu.description}
          </Text>

          {/* Option groups */}
          <View className="mt-10">
            {optionGroups.map((group) => {
              if (!isGroupVisible(group)) return null;

              const hint =
                  group.type === "multi"
                      ? group.required
                          ? `Choose up to ${group.maxSelect}`
                          : `Optional (up to ${group.maxSelect})`
                      : group.required
                          ? "Please select 1 option"
                          : "Optional";

              return (
                  <View key={group.id} className="mt-8">
                    <Text className="h3-bold text-dark-100 text-center">{group.title}</Text>
                    {hint ? <Text className="paragraph-regular text-gray-200 mt-2 text-center">{hint}</Text> : null}

                    {/* Single (radio) */}
                    {group.type === "single" ? (
                        <View className="mt-1">
                          {group.options.map((opt) => (
                              <RadioRow
                                  key={opt.id}
                                  label={opt.label}
                                  price={opt.price}
                                  selected={selectedSingles[group.id] === opt.id}
                                  onPress={() => setSingle(group.id, opt.id)}
                              />
                          ))}
                        </View>
                    ) : null}

                    {/* Multi (checkbox with maxSelect) */}
                    {group.type === "multi" ? (
                        <View className="mt-1">
                          {group.options.map((opt) => {
                            const selected = (selectedMultis[group.id] ?? []).includes(opt.id);
                            const selectedCount = (selectedMultis[group.id] ?? []).length;
                            const disabled = !selected && selectedCount >= group.maxSelect;

                            return (
                                <CheckRow
                                    key={opt.id}
                                    label={opt.label}
                                    selected={selected}
                                    disabled={disabled}
                                    onPress={() => toggleMulti(group.id, opt.id, group.maxSelect)}
                                />
                            );
                          })}
                        </View>
                    ) : null}
                  </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 pb-8 border-t border-gray-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
              <TouchableOpacity
                  disabled={qty <= 1}
                  onPress={() => setQty((q: number) => Math.max(1, q - 1))}
              >
                <Image
                    source={images.minus}
                    className="size-4"
                    resizeMode="contain"
                    tintColor={qty <= 1 ? "#C7C7C7" : "#FE8C00"}
                />
              </TouchableOpacity>

              <Text className="paragraph-bold text-dark-100 mx-4">{qty}</Text>

              <TouchableOpacity onPress={() => setQty((q: number) => q + 1)}>
                <Image source={images.plus} className="size-4" resizeMode="contain" tintColor="#FE8C00" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
                className={`rounded-full px-6 py-4 flex-row items-center ${canAddToCart ? "bg-primary" : "bg-gray-200"}`}
                onPress={addToCart}
                disabled={!canAddToCart}
            >
              <Image source={images.bag} className="size-5 mr-2" resizeMode="contain" tintColor="#fff" />
              <Text className="paragraph-bold text-white">
                Add to cart (£{total.toFixed(2)})
              </Text>
            </TouchableOpacity>
          </View>

          {!canAddToCart ? (
              <Text className="text-center text-gray-200 mt-3">
                Please complete all required selections above.
              </Text>
          ) : null}
        </View>
      </SafeAreaView>
  );
}

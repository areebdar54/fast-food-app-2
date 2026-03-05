/**
 * Option groups configuration for menu items.
 * Matches by menu item name (from Appwrite) and category.
 */

export type Option = { id: string; label: string; price?: number };

export type DependsOn =
    | { groupId: string; optionId: string }
    | { groupId: string; optionIds: string[] };

export type OptionGroup =
    | {
          id: string;
          title: string;
          type: "single";
          required?: boolean;
          options: Option[];
          dependsOn?: DependsOn;
      }
    | {
          id: string;
          title: string;
          type: "multi";
          required?: boolean;
          maxSelect: number;
          options: Option[];
          dependsOn?: DependsOn;
      };

// ─── Shared option lists ─────────────────────────────────────────────────

const MEAL_OPTIONS: Option[] = [
    { id: "meal_yes", label: "Yes", price: 3.5 },
    { id: "meal_no", label: "No", price: 0 },
];

const MEAL_SIDES: Option[] = [
    { id: "chips", label: "Chips" },
    { id: "wedges", label: "Wedges" },
    { id: "spicy_rice", label: "Spicy Rice" },
    { id: "nuggets", label: "Nuggets" },
    { id: "onion_rings", label: "Onion Rings" },
    { id: "mozzarella_sticks", label: "Mozzarella Sticks" },
    { id: "bottomless_sf_drink", label: "Bottomless Sugar-Free Drink" },
];

const FLAVOUR_OPTIONS: Option[] = [
    { id: "extra_hot", label: "Extra Hot" },
    { id: "hot", label: "Hot" },
    { id: "roasted_chilli", label: "Roasted Chilli" },
    { id: "lemon_herb", label: "Lemon & Herb" },
    { id: "lemon_chilli", label: "Lemon & Chilli" },
    { id: "preggo", label: "Preggo" },
    { id: "iqras_special", label: "IQRAS Special" },
];

const SEASONING_OPTIONS: Option[] = [
    { id: "siracha", label: "Siracha" },
    { id: "nashville", label: "Nashville" },
    { id: "buffalo", label: "Buffalo" },
    { id: "garlic_butter", label: "Garlic Butter" },
    { id: "chilli_lime", label: "Chilli & Lime" },
    { id: "brootal", label: "Brootal" },
    { id: "honey_chilli", label: "Honey Chilli" },
];

const TOPPING_OPTIONS: Option[] = [
    { id: "lettuce", label: "Lettuce" },
    { id: "cucumber", label: "Cucumber" },
    { id: "red_onions", label: "Red Onions" },
    { id: "peppers", label: "Peppers" },
    { id: "jalapenos", label: "Jalapenos" },
    { id: "gherkins", label: "Gherkins" },
    { id: "olives", label: "Olives" },
];

const CAN_OPTIONS: Option[] = [
    { id: "pepsi", label: "Pepsi" },
    { id: "pepsi_max", label: "Pepsi Max" },
    { id: "7up", label: "7up" },
    { id: "fanta", label: "Fanta" },
    { id: "irn_bru", label: "Irn Bru" },
    { id: "rio", label: "Rio" },
];

const PORTION_QUARTER_HALF_FULL: Option[] = [
    { id: "quarter", label: "1/4", price: 0 },
    { id: "half", label: "1/2", price: 2.5 },
    { id: "full", label: "Full", price: 8 },
];

const PORTION_3PC_6PC_10PC: Option[] = [
    { id: "3pc", label: "3pc", price: 0 },
    { id: "6pc", label: "6pc", price: 2.24 },
    { id: "10pc", label: "10pc", price: 5.74 },
];

// ─── Helper: meal + sides (depends on meal_yes) ───────────────────────────

function mealAndSides(): OptionGroup[] {
    return [
        {
            id: "meal",
            title: "Make it a Meal!",
            type: "single",
            required: true,
            options: MEAL_OPTIONS,
        },
        {
            id: "meal_sides",
            title: "Choose 2 sides",
            type: "multi",
            required: true,
            maxSelect: 2,
            options: MEAL_SIDES,
            dependsOn: { groupId: "meal", optionId: "meal_yes" },
        },
    ];
}

// ─── Per-item group definitions (key = normalized menu name) ───────────────

type ItemGroups = (menu: any) => OptionGroup[];

const ITEM_CONFIG: Record<string, ItemGroups> = {
    // Peri Collection
    "peri peri chicken": (menu) => {
        const portionOpts = parseVariantsToOptions(menu?.variants) ?? PORTION_QUARTER_HALF_FULL;
        return [
            { id: "portion", title: "Choose portion", type: "single", required: true, options: portionOpts },
            ...mealAndSides(),
            { id: "flavour", title: "Choose Flavour", type: "single", required: true, options: FLAVOUR_OPTIONS },
        ];
    },
    "peri peri wings": (menu) => {
        const portionOpts = parseVariantsToOptions(menu?.variants) ?? PORTION_3PC_6PC_10PC;
        return [
            { id: "portion", title: "Choose portion", type: "single", required: true, options: portionOpts },
            ...mealAndSides(),
            { id: "flavour", title: "Choose Flavour", type: "single", required: true, options: FLAVOUR_OPTIONS },
        ];
    },
    "peri peri tenders": (menu) => {
        const portionOpts = parseVariantsToOptions(menu?.variants) ?? PORTION_3PC_6PC_10PC;
        return [
            { id: "portion", title: "Choose portion", type: "single", required: true, options: portionOpts },
            ...mealAndSides(),
            { id: "flavour", title: "Choose Flavour", type: "single", required: true, options: FLAVOUR_OPTIONS },
        ];
    },

    // Burgers (all have meal > sides)
    "double smash burger": (menu) => mealAndSides(),
    "triple smash burger": (menu) => mealAndSides(),
    "american style": (menu) => mealAndSides(),
    "chicken tikka burger": (menu) => mealAndSides(),
    "flavour fusion stack 2": (menu) => mealAndSides(),
    "peri peri burger": (menu) => [
        ...mealAndSides(),
        { id: "flavour", title: "Choose Flavour", type: "single", required: true, options: FLAVOUR_OPTIONS },
    ],
    "flavour fusion stack 1": (menu) => [
        ...mealAndSides(),
        {
            id: "chicken_type",
            title: "Choose chicken",
            type: "single",
            required: true,
            options: [
                { id: "peri", label: "Peri" },
                { id: "tikka", label: "Tikka" },
            ],
        },
    ],
    "chicken fillet burger": (menu) => [
        ...mealAndSides(),
        { id: "seasoning", title: "Choose Seasoning", type: "single", required: true, options: SEASONING_OPTIONS },
    ],
    "supreme burger": (menu) => [
        ...mealAndSides(),
        { id: "seasoning", title: "Choose Seasoning", type: "single", required: true, options: SEASONING_OPTIONS },
    ],
    "mexican burger": (menu) => [
        ...mealAndSides(),
        { id: "seasoning", title: "Choose Seasoning", type: "single", required: true, options: SEASONING_OPTIONS },
    ],

    // Wraps
    "peri peri wrap": (menu) => [
        ...mealAndSides(),
        { id: "flavour", title: "Choose Flavour", type: "single", required: true, options: FLAVOUR_OPTIONS },
    ],
    "chicken tikka wrap": (menu) => mealAndSides(),
    "chicken wrap": (menu) => [
        ...mealAndSides(),
        { id: "seasoning", title: "Choose Seasoning", type: "single", required: true, options: SEASONING_OPTIONS },
    ],
    "mexican wrap": (menu) => [
        ...mealAndSides(),
        { id: "seasoning", title: "Choose Seasoning", type: "single", required: true, options: SEASONING_OPTIONS },
    ],

    // Pittas
    "peri peri pitta": (menu) => [
        { id: "toppings", title: "Choose (4) toppings", type: "multi", required: true, maxSelect: 4, options: TOPPING_OPTIONS },
        ...mealAndSides(),
        { id: "flavour", title: "Choose Flavour", type: "single", required: true, options: FLAVOUR_OPTIONS },
    ],
    "chicken tikka pitta": (menu) => [
        { id: "toppings", title: "Choose (4) toppings", type: "multi", required: true, maxSelect: 4, options: TOPPING_OPTIONS },
        ...mealAndSides(),
    ],

    // Fried Collection
    "chicken wings": (menu) => {
        const portionOpts = parseVariantsToOptions(menu?.variants) ?? PORTION_3PC_6PC_10PC;
        return [
            { id: "portion", title: "Choose portion", type: "single", required: true, options: portionOpts },
            ...mealAndSides(),
            { id: "seasoning", title: "Choose Seasoning", type: "single", required: true, options: SEASONING_OPTIONS },
        ];
    },
    "chicken tenders": (menu) => {
        const portionOpts = parseVariantsToOptions(menu?.variants) ?? PORTION_3PC_6PC_10PC;
        return [
            { id: "portion", title: "Choose portion", type: "single", required: true, options: portionOpts },
            ...mealAndSides(),
            { id: "seasoning", title: "Choose Seasoning", type: "single", required: true, options: SEASONING_OPTIONS },
        ];
    },

    // Selects
    "loaded fries": (menu) => [
        {
            id: "meat",
            title: "Choose meat",
            type: "single",
            required: true,
            options: [
                { id: "peri", label: "Peri" },
                { id: "tikka", label: "Tikka" },
                { id: "smashed_beef", label: "Smashed Beef" },
                { id: "chicken", label: "Chicken" },
            ],
        },
    ],
    "spicy rice box": (menu) => [
        {
            id: "chicken_type",
            title: "Choose chicken",
            type: "single",
            required: true,
            options: [
                { id: "peri", label: "Peri" },
                { id: "tikka", label: "Tikka" },
            ],
        },
        ...mealAndSides(),
    ],
    "chicken salad box": (menu) => [
        {
            id: "chicken_type",
            title: "Choose chicken",
            type: "single",
            required: true,
            options: [
                { id: "peri", label: "Peri" },
                { id: "tikka", label: "Tikka" },
            ],
        },
        ...mealAndSides(),
    ],

    // MunchBox
    "iqras munchbox": (menu) => [
        {
            id: "munchbox_burger",
            title: "Choose burger",
            type: "single",
            required: true,
            options: [
                { id: "double_smash", label: "Double Smash Burger" },
                { id: "peri_burger", label: "Peri Burger" },
                { id: "tikka_burger", label: "Tikka Burger" },
                { id: "chicken_fillet", label: "Chicken Fillet Burger" },
                { id: "supreme", label: "Supreme Burger" },
                { id: "mexican", label: "Mexican Burger" },
            ],
        },
        {
            id: "munchbox_burger_flavour",
            title: "Choose Flavour",
            type: "single",
            required: true,
            options: FLAVOUR_OPTIONS,
            dependsOn: { groupId: "munchbox_burger", optionId: "peri_burger" },
        },
        {
            id: "munchbox_burger_seasoning",
            title: "Choose Seasoning",
            type: "single",
            required: true,
            options: SEASONING_OPTIONS,
            dependsOn: { groupId: "munchbox_burger", optionIds: ["chicken_fillet", "supreme", "mexican"] },
        },
        {
            id: "munchbox_wings",
            title: "Choose wings and tenders",
            type: "single",
            required: true,
            options: [
                { id: "peri", label: "Peri" },
                { id: "fried", label: "Fried" },
            ],
        },
        {
            id: "munchbox_wings_flavour",
            title: "Choose Flavour",
            type: "single",
            required: true,
            options: FLAVOUR_OPTIONS,
            dependsOn: { groupId: "munchbox_wings", optionId: "peri" },
        },
        {
            id: "munchbox_wings_seasoning",
            title: "Choose Seasoning",
            type: "single",
            required: true,
            options: SEASONING_OPTIONS,
            dependsOn: { groupId: "munchbox_wings", optionId: "fried" },
        },
        {
            id: "munchbox_loaded_fries",
            title: "Choose loaded fries",
            type: "single",
            required: true,
            options: [
                { id: "peri", label: "Peri" },
                { id: "tikka", label: "Tikka" },
                { id: "smashed_beef", label: "Smashed Beef" },
                { id: "chicken", label: "Chicken" },
            ],
        },
        {
            id: "munchbox_bottomless",
            title: "Upgrade to bottomless drink (for £1)",
            type: "single",
            required: true,
            options: [
                { id: "yes", label: "Yes", price: 1 },
                { id: "no", label: "No", price: 0 },
            ],
        },
    ],

    // Veg Collection
    "veggie burger": (menu) => [
        { id: "toppings", title: "Choose (4) toppings", type: "multi", required: true, maxSelect: 4, options: TOPPING_OPTIONS },
        ...mealAndSides(),
        { id: "seasoning", title: "Choose Seasoning", type: "single", required: true, options: SEASONING_OPTIONS },
    ],
    "veggie wrap": (menu) => [
        { id: "toppings", title: "Choose (4) toppings", type: "multi", required: true, maxSelect: 4, options: TOPPING_OPTIONS },
        ...mealAndSides(),
        { id: "seasoning", title: "Choose Seasoning", type: "single", required: true, options: SEASONING_OPTIONS },
    ],
    "veggie pitta": (menu) => [
        { id: "toppings", title: "Choose (4) toppings", type: "multi", required: true, maxSelect: 4, options: TOPPING_OPTIONS },
        ...mealAndSides(),
        { id: "seasoning", title: "Choose Seasoning", type: "single", required: true, options: SEASONING_OPTIONS },
    ],

    // Kids
    "kids chicken burger meal": (menu) => [
        {
            id: "burger_options",
            title: "Burger options",
            type: "multi",
            required: false,
            maxSelect: 2,
            options: [
                { id: "no_salad", label: "No salad" },
                { id: "no_sauce", label: "No sauce" },
            ],
        },
    ],
    "kids chicken nugget meal": () => [],
    "kids chicken tender meal": () => [],
    "kids mozzarella sticks meal": () => [],

    // Platters
    "platter 1": (menu) => [
        { id: "platter_flavour", title: "Choose flavour", type: "single", required: true, options: FLAVOUR_OPTIONS },
        {
            id: "chips_or_rice",
            title: "Choose between",
            type: "single",
            required: true,
            options: [
                { id: "chips", label: "Chips" },
                { id: "rice", label: "Rice" },
            ],
        },
        { id: "can", title: "Choose (1) can", type: "single", required: true, options: CAN_OPTIONS },
    ],
    "platter 2": (menu) => [
        { id: "platter_flavour", title: "Choose flavour", type: "single", required: true, options: FLAVOUR_OPTIONS },
        {
            id: "chips_or_rice",
            title: "Choose between",
            type: "single",
            required: true,
            options: [
                { id: "chips", label: "Chips" },
                { id: "rice", label: "Rice" },
            ],
        },
        { id: "can", title: "Choose (1) can", type: "single", required: true, options: CAN_OPTIONS },
    ],
    "platter 3": (menu) => [
        { id: "platter_flavour", title: "Choose flavour", type: "single", required: true, options: FLAVOUR_OPTIONS },
        {
            id: "chips_or_rice",
            title: "Choose between",
            type: "single",
            required: true,
            options: [
                { id: "2_chips", label: "2 Chips" },
                { id: "2_rice", label: "2 Rice" },
                { id: "1_each", label: "1 Chips & 1 Rice" },
            ],
        },
        { id: "can", title: "Choose (up to 2) cans", type: "multi", required: true, maxSelect: 2, options: CAN_OPTIONS },
    ],
    "platter 4": (menu) => [
        { id: "platter_flavour", title: "Choose flavour", type: "single", required: true, options: FLAVOUR_OPTIONS },
        {
            id: "chips_or_rice",
            title: "Choose between",
            type: "single",
            required: true,
            options: [
                { id: "4_chips", label: "4 Chips" },
                { id: "4_rice", label: "4 Rice" },
                { id: "2_each", label: "2 Chips & 2 Rice" },
            ],
        },
        { id: "can", title: "Choose (up to 4) cans", type: "multi", required: true, maxSelect: 4, options: CAN_OPTIONS },
    ],
    "wings platter": (menu) => [
        { id: "platter_flavour", title: "Choose flavour", type: "single", required: true, options: FLAVOUR_OPTIONS },
        {
            id: "chips_or_rice",
            title: "Choose between",
            type: "single",
            required: true,
            options: [
                { id: "2_chips", label: "2 Chips" },
                { id: "2_rice", label: "2 Rice" },
                { id: "1_each", label: "1 Chips & 1 Rice" },
            ],
        },
    ],
    "boneless platter": (menu) => [
        { id: "platter_flavour", title: "Choose flavour", type: "single", required: true, options: FLAVOUR_OPTIONS },
        {
            id: "chips_or_rice",
            title: "Choose between",
            type: "single",
            required: true,
            options: [
                { id: "2_chips", label: "2 Chips" },
                { id: "2_rice", label: "2 Rice" },
                { id: "1_each", label: "1 Chips & 1 Rice" },
            ],
        },
    ],

    // Sides
    "fries": (menu) => [
        { id: "seasoning", title: "Choose seasoning (for £0.50)", type: "single", required: false, options: SEASONING_OPTIONS.map((o) => ({ ...o, price: 0.5 })) },
    ],
    "potato wedges": (menu) => [
        { id: "seasoning", title: "Choose seasoning (for £0.50)", type: "single", required: false, options: SEASONING_OPTIONS.map((o) => ({ ...o, price: 0.5 })) },
    ],
};

function parseVariantsToOptions(variants: string | null | undefined): Option[] | null {
    if (!variants) return null;
    try {
        const arr = typeof variants === "string" ? JSON.parse(variants) : variants;
        if (!Array.isArray(arr) || arr.length === 0) return null;
        const basePrice = arr[0]?.price ?? 0;
        return arr.map((v: { name: string; price: number }, i: number) => ({
            id: (v.name || `opt_${i}`).toLowerCase().replace(/\s+/g, "_"),
            label: v.name,
            price: i === 0 ? 0 : (v.price ?? 0) - basePrice,
        }));
    } catch {
        return null;
    }
}

function slug(name: string): string {
    return name.toLowerCase().trim();
}

export function getOptionGroupsForMenu(menu: any): OptionGroup[] {
    if (!menu?.name) return [];
    const key = slug(menu.name);
    const fn = ITEM_CONFIG[key];
    if (fn) return fn(menu);

    // Fallback: no option groups
    return [];
}

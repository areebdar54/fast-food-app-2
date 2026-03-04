const placeholderImage = "https://placehold.co/600x400?text=Coming+Soon";

export type RealCategory = { name: string; description: string };
export type RealVariant = { name: string; price: number };

export type RealMenuItem = {
    name: string;
    price: number;
    description: string;
    image_url: string;
    category_name: string;
    type?: string;
    variants?: RealVariant[];
    image_slug?: string; // override auto-slug when bucket filename differs from menu name
};

export const realCategories: RealCategory[] = [
    { name: "Peri Collection", description: "Peri Collection menu items." },
    { name: "Burgers", description: "Burgers menu items." },
    { name: "Wraps", description: "Wraps menu items." },
    { name: "Pittas", description: "Pittas menu items." },
    { name: "Fried Collection", description: "Fried Collection menu items." },
    { name: "Selects", description: "Selects menu items." },
    { name: "MunchBox", description: "MunchBox menu items." },
    { name: "Veg Collection", description: "Veg Collection menu items." },
    { name: "Kids Collection", description: "Kids Collection menu items." },
    { name: "Platters", description: "Platters menu items." },
    { name: "Sides", description: "Sides menu items." },
    { name: "Desserts", description: "Desserts menu items." },
    { name: "Drinks", description: "Drinks menu items." },
];

const periPortions: RealVariant[] = [
    { name: "Quarter", price: 5.99 },
    { name: "Half", price: 8.49 },
    { name: "Full", price: 13.99 },
];
const wingsTendersPortions: RealVariant[] = [
    { name: "3pc", price: 3.75 },
    { name: "6pc", price: 5.99 },
    { name: "10pc", price: 9.49 },
];

export const realMenu: RealMenuItem[] = [
    { name: "Peri Peri Chicken", price: 5.99, description: "Juicy, flame-grilled chicken marinated in bold peri-peri spices, offering spicy and zesty flavours in every bite. Perfectly customizable to your preferred heat level.", image_url: placeholderImage, category_name: "Peri Collection", variants: periPortions, image_slug: "peri-chicken" },
    { name: "Peri Peri Wings", price: 3.75, description: "Juicy, flame-grilled chicken wings marinated in bold peri-peri spices, offering spicy and zesty flavours in every bite. Perfectly customizable to your preferred heat level.", image_url: placeholderImage, category_name: "Peri Collection", variants: wingsTendersPortions, image_slug: "peri-wings" },
    { name: "Peri Peri Tenders", price: 3.75, description: "Juicy, flame-grilled chicken tenders marinated in bold peri-peri spices, offering spicy and zesty flavours in every bite. Perfectly customizable to your preferred heat level.", image_url: placeholderImage, category_name: "Peri Collection", variants: wingsTendersPortions, image_slug: "peri-tenders" },

    { name: "Double Smash Burger", price: 6.99, description: "Two freshly smashed beef patties, melted cheese, and house sauce stacked in a soft brioche bun for a rich, juicy bite.", image_url: placeholderImage, category_name: "Burgers" },
    { name: "Triple Smash Burger", price: 7.99, description: "Three freshly smashed beef patties, melted cheese, and house sauce stacked in a soft brioche bun for a rich, juicy bite.", image_url: placeholderImage, category_name: "Burgers" },
    { name: "Flavour Fusion Stack 1", price: 7.99, description: "A juicy smashed beef patty paired with your choice of grilled Chicken Tikka or Peri-Chicken fillet, layered with caramelised onions, gherkins, melted cheese, crisp lettuce, and house sauce in a toasted bun.", image_url: placeholderImage, category_name: "Burgers", image_slug: "flavour-fusion-stack1" },
    { name: "Flavour Fusion Stack 2", price: 7.99, description: "A juicy smashed beef patty paired with a crispy fried chicken fillet, layered with caramelised onions, gherkins, melted cheese, crisp lettuce, and house sauce in a toasted bun.", image_url: placeholderImage, category_name: "Burgers", image_slug: "flavour-fusion-stack2" },
    { name: "American Style", price: 7.99, description: "Three freshly smashed beef patties stacked high with crispy onion rings, fried onions, crisp lettuce, and smoky BBQ sauce in a toasted bun.", image_url: placeholderImage, category_name: "Burgers" },
    { name: "Peri Peri Burger", price: 5.99, description: "A tender peri-peri chicken fillet, flame-grilled for rich smoky heat, layered with crisp lettuce, melted cheese, and house sauce in a toasted bun.", image_url: placeholderImage, category_name: "Burgers", image_slug: "peri-burger" },
    { name: "Chicken Tikka Burger", price: 5.99, description: "A juicy chicken tikka fillet, flame-grilled for bold aromatic flavour, layered with crisp lettuce, melted cheese, and house sauce in a toasted bun.", image_url: placeholderImage, category_name: "Burgers", image_slug: "tikka-burger" },
    { name: "Chicken Fillet Burger", price: 5.99, description: "A crispy fried chicken fillet with a golden crunch, layered with crisp lettuce, melted cheese, and house sauce in a toasted bun.", image_url: placeholderImage, category_name: "Burgers" },
    { name: "Supreme Burger", price: 6.69, description: "A crispy fried chicken fillet paired with a soft hash brown, layered with crisp lettuce, melted cheese, and house sauce in a toasted bun.", image_url: placeholderImage, category_name: "Burgers" },
    { name: "Mexican Burger", price: 6.49, description: "A crispy fried chicken fillet with a golden crunch, layered with crisp lettuce, red onions, jalapenos, melted cheese, and house sauce in a toasted bun.", image_url: placeholderImage, category_name: "Burgers" },

    { name: "Peri Peri Wrap", price: 5.99, description: "Flame-grilled peri-peri chicken wrapped with crisp lettuce, melted cheese, and house sauce for a warm, smoky bite in every wrap.", image_url: placeholderImage, category_name: "Wraps", image_slug: "peri-wrap" },
    { name: "Chicken Tikka Wrap", price: 5.99, description: "Flame-grilled chicken tikka wrapped with crisp lettuce, melted cheese, and house sauce for a bold, aromatic bite in every wrap.", image_url: placeholderImage, category_name: "Wraps", image_slug: "tikka-wrap" },
    { name: "Chicken Wrap", price: 5.99, description: "Crispy fried chicken wrapped with crisp lettuce, melted cheese, and house sauce for a crunchy, satisfying bite in every wrap.", image_url: placeholderImage, category_name: "Wraps" },
    { name: "Mexican Wrap", price: 6.49, description: "Crispy fried chicken wrapped with crisp lettuce, red onions, jalapenos, melted cheese, and house sauce for a crunchy, flavourful bite in every wrap.", image_url: placeholderImage, category_name: "Wraps" },

    { name: "Peri Peri Pitta", price: 5.99, description: "Juicy, flame-grilled chicken, wrapped in a soft pitta with fresh salad and creamy mayo.", image_url: placeholderImage, category_name: "Pittas", image_slug: "peri-pitta" },
    { name: "Chicken Tikka Pitta", price: 5.99, description: "Tender chicken tikka, marinated in rich spices, wrapped in a soft pitta with fresh salad and creamy mayo.", image_url: placeholderImage, category_name: "Pittas", image_slug: "tikka-pitta" },

    { name: "Chicken Wings", price: 3.75, description: "Crispy on the outside, juicy on the inside – our fried chicken wings are coated in your choice of seven signature rubs and salts.", image_url: placeholderImage, category_name: "Fried Collection", variants: wingsTendersPortions },
    { name: "Chicken Tenders", price: 3.75, description: "Golden, crispy, and irresistibly tender, our chicken tenders are coated in your choice of seven signature rubs and salts.", image_url: placeholderImage, category_name: "Fried Collection", variants: wingsTendersPortions },

    { name: "Loaded Fries", price: 6.99, description: "Crispy fries piled high with your choice of fried chicken, peri peri chicken, chicken tikka, or smashed beef, topped with melted cheese, jalapenos, crispy fried onions, garlic sauce, and our signature house sauce – finished with a sprinkle of any of our seven exclusive rubs.", image_url: placeholderImage, category_name: "Selects" },
    { name: "Spicy Rice Box", price: 6.99, description: "A hearty box of fragrant, spiced rice served with your choice of tender chicken tikka or juicy peri peri chicken.", image_url: placeholderImage, category_name: "Selects" },
    { name: "Chicken Salad Box", price: 6.99, description: "A fresh, vibrant salad topped with your choice of juicy peri peri chicken or flavorful chicken tikka, finished with crisp vegetables and our house sauce.", image_url: placeholderImage, category_name: "Selects" },

    { name: "IQRAs MunchBox", price: 14.99, description: "The ultimate feast in one box – enjoy any chicken burger, two crispy wings, a tender, your choice of loaded fries with a signature rub, and a refreshing can of drink.", image_url: placeholderImage, category_name: "MunchBox", image_slug: "munchbox" },

    { name: "Veggie Burger", price: 5.99, description: "A golden veggie patty stacked with crisp lettuce, melted cheese, fresh vegetables, and house sauce, served in a soft bun for a rich, satisfying bite.", image_url: placeholderImage, category_name: "Veg Collection" },
    { name: "Veggie Wrap", price: 5.99, description: "A golden veggie patty wrapped with crisp lettuce, melted cheese, fresh vegetables, and house sauce for a warm, satisfying bite in every wrap.", image_url: placeholderImage, category_name: "Veg Collection" },
    { name: "Veggie Pitta", price: 5.99, description: "A golden veggie patty tucked into a warm pitta with crisp lettuce, melted cheese, fresh vegetables, and house sauce for a perfectly balanced, flavorful bite.", image_url: placeholderImage, category_name: "Veg Collection" },

    { name: "Kids Chicken Burger Meal", price: 4.99, description: "A tender chicken steak burger served in a soft bun with crispy chips and a refreshing drink, perfectly sized for a happy kids’ meal.", image_url: placeholderImage, category_name: "Kids Collection", image_slug: "kids-burger" },
    { name: "Kids Chicken Nugget Meal", price: 4.99, description: "Four golden chicken nuggets served with crispy chips and a refreshing drink, perfectly sized for little appetites.", image_url: placeholderImage, category_name: "Kids Collection", image_slug: "nuggets" },
    { name: "Kids Chicken Tender Meal", price: 4.99, description: "Two golden chicken tenders served with crispy chips and a refreshing drink, perfectly sized for little appetites.", image_url: placeholderImage, category_name: "Kids Collection", image_slug: "kids-tenders" },
    { name: "Kids Mozzarella Sticks Meal", price: 4.99, description: "Four golden mozzarella sticks served with crispy chips and a refreshing drink, perfectly sized for little appetites.", image_url: placeholderImage, category_name: "Kids Collection", image_slug: "mozzarella-sticks" },

    { name: "Platter 1", price: 12.49, description: "A generous platter featuring a quarter peri peri chicken, a peri peri burger, two peri wings, served with your choice of rice or chips and a refreshing can of drink for a bold, satisfying feast.", image_url: placeholderImage, category_name: "Platters", image_slug: "platter" },
    { name: "Platter 2", price: 12.49, description: "A hearty platter featuring a half peri peri chicken and three peri wings, served with your choice of rice or chips and a refreshing can of drink for a bold, satisfying meal.", image_url: placeholderImage, category_name: "Platters", image_slug: "platter" },
    { name: "Platter 3", price: 22.99, description: "A feast for sharing: a full peri peri chicken with six peri wings, served with two portions of your choice of rice or chips and two refreshing cans of drink for a bold, flavour-packed experience.", image_url: placeholderImage, category_name: "Platters", image_slug: "platter" },
    { name: "Platter 4", price: 39.99, description: "The ultimate sharing feast: two full peri peri chickens with twelve peri wings, served with four portions of your choice of rice or chips, a bowl of fresh salad, and four refreshing cans of drink for a bold, flavour-packed experience.", image_url: placeholderImage, category_name: "Platters", image_slug: "platter" },
    { name: "Wings Platter", price: 17.99, description: "A generous platter of 20 juicy peri peri wings, served with two portions of your choice of rice or chips for a bold, flavour-packed feast perfect for sharing.", image_url: placeholderImage, category_name: "Platters", image_slug: "platter" },
    { name: "Boneless Platter", price: 17.99, description: "A hearty platter featuring a peri peri burger, a peri peri wrap, and four peri peri tenders, served with two portions of your choice of rice or chips for a satisfying, flavour-packed meal.", image_url: placeholderImage, category_name: "Platters", image_slug: "platter" },

    { name: "Fries", price: 2.49, description: "Crispy golden fries", image_url: placeholderImage, category_name: "Sides" },
    { name: "Potato Wedges", price: 2.99, description: "Crispy Potato Wedges", image_url: placeholderImage, category_name: "Sides" },
    { name: "Spicy Rice", price: 2.99, description: "A hearty box of fragrant, spiced rice", image_url: placeholderImage, category_name: "Sides", image_slug: "spicy-rice-box" },
    { name: "Mix Fresh Salad", price: 2.99, description: "A fresh, vibrant salad", image_url: placeholderImage, category_name: "Sides", image_slug: "chicken-salad-box" },
    { name: "Chicken Nuggets", price: 2.99, description: "Six golden chicken nuggets", image_url: placeholderImage, category_name: "Sides", image_slug: "nuggets" },
    { name: "Onion Rings", price: 2.49, description: "Six golden onion rings", image_url: placeholderImage, category_name: "Sides" },
    { name: "Mozzarella Sticks", price: 2.99, description: "Six golden mozzarella sticks", image_url: placeholderImage, category_name: "Sides" },

    { name: "Matilda Cake", price: 5.49, description: "A rich, decadent slice of Matilda cake with layers of moist sponge and creamy frosting, offering a sweet, indulgent treat for every occasion.", image_url: placeholderImage, category_name: "Desserts" },
    { name: "Churros", price: 3.49, description: "Golden, crispy churros dusted with cinnamon sugar, served warm with a side of chocolate sauce for a sweet, satisfying treat.", image_url: placeholderImage, category_name: "Desserts" },

    { name: "Sugar free bottomless drink", price: 2.99, description: "No description yet.", image_url: placeholderImage, category_name: "Drinks", image_slug: "bottomless-drink" },
    { name: "Can", price: 1.29, description: "No description yet.", image_url: placeholderImage, category_name: "Drinks", image_slug: "cans" },
    { name: "Fruitshoot", price: 1.29, description: "No description yet.", image_url: placeholderImage, category_name: "Drinks" },
    { name: "Water", price: 1, description: "No description yet.", image_url: placeholderImage, category_name: "Drinks" },
    { name: "Karak Chai", price: 1.89, description: "No description yet.", image_url: placeholderImage, category_name: "Drinks" },
    { name: "Mint Tea", price: 1.89, description: "No description yet.", image_url: placeholderImage, category_name: "Drinks" },
];

export default { categories: realCategories, menu: realMenu };

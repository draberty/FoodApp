var db = new Dexie("MealsDB");

db.version(1).stores({
    meals:
        "++id, name, *categories, subCategory, *ingredients, sidesAllowed, isAllergen",
    sides: "++id, name, *categories, isAllergen",
});

db.version(2).stores({
    meals:
        "++id, name, *categories, subCategory, *ingredients, sidesAllowed, isAllergen",
    sides: "++id, name, *categories, isAllergen",
    course: "++id, category, mealId, *sideIds, date",
    inventory: "++id, &name, qty, unit, step",
}).upgrade(tx => {
    // Safely seeds inventory when upgrading or initializing version 2
    return tx.inventory.bulkAdd([
        {
            name: "Cheese",
            qty: 1,
            unit: "Bags",
        },
    ]);
});

db.version(3).stores({
    meals:
        "++id, name, *categories, subCategory, *ingredients, sidesAllowed, isAllergen",
    sides: "++id, name, *categories, isAllergen",
    course: "++id, name, *days, mealId, *sideIds, date",
    inventory: "++id, &name, qty, unit, step",
});

// Fires ONLY when version 1 is first created on a device
db.on("populate", function () {
    db.meals.bulkAdd([
        // --- MORNING MEALS ---
        {
            id: 1,
            name: "Breakfast Bowl",
            categories: ["Morning"],
            subCategory: "",
            ingredients: [
                "Diced Hashbrowns",
                "Sausage/Chicken",
                "Eggs",
                "Cheese",
                "Salsa",
            ],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 2,
            name: "Yogurt + Fruit",
            categories: ["Morning"],
            subCategory: "",
            ingredients: ["Yogurt cup", "Fruit cup", "Toast"],
            sidesAllowed: 0,
            isAllergen: false,
        },

        // --- AFTERNOON MEALS (PASTA) ---
        {
            id: 3,
            name: "Chicken Marinara",
            categories: ["Afternoon"],
            subCategory: "Pasta Meals",
            ingredients: [
                "Rotini Marinara/Noodles + Sauce",
                "Broccoli",
                "Chicken Tenders",
                "Parmesan Cheese",
            ],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 4,
            name: "Chicken Alfredo",
            categories: ["Afternoon"],
            subCategory: "Pasta Meals",
            ingredients: [
                "Chicken Tenders",
                "Broccoli",
                "Rotini Alfredo/Noodles",
                "Heavy Cream",
                "Parmesan Cheese",
            ],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 5,
            name: "Mac and Cheese",
            categories: ["Afternoon"],
            subCategory: "Pasta Meals",
            ingredients: [
                "Boxed Mac + Cheese/Elbow Pasta",
                "Heavy Cream",
                "Milk",
                "Velveeta",
                "Cheddar Cheese",
            ],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 6,
            name: "Rattlesnake Pasta",
            categories: ["Afternoon"],
            subCategory: "Pasta Meals",
            ingredients: [
                "Alfredo Pasta",
                "Green/Red Pepper",
                "Onion",
                "Corn",
                "Black Beans",
                "Chicken Tenders",
            ],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 7,
            name: "Taco Mac",
            categories: ["Afternoon"],
            subCategory: "Pasta Meals",
            ingredients: ["Taco Meat", "Mac and Cheese"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 8,
            name: "Spaghetti",
            categories: ["Afternoon"],
            subCategory: "Pasta Meals",
            ingredients: ["Rotini Marinara/Noodles + Sauce", "Meatballs/Meat Sauce"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 9,
            name: "Broccoli Mac",
            categories: ["Afternoon"],
            subCategory: "Pasta Meals",
            ingredients: ["Roasted Broccoli", "Mac and Cheese"],
            sidesAllowed: 0,
            isAllergen: false,
        },

        // --- AFTERNOON MEALS (SANDWICHES) ---
        {
            id: 10,
            name: "Pizza Sandwich",
            categories: ["Afternoon"],
            subCategory: "Sandwiches",
            ingredients: [
                "Pepperoni",
                "Mozzarella",
                "Parmesan",
                "Garlic Butter",
                "Bread",
            ],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 11,
            name: "Hot Turkey and Cheese",
            categories: ["Afternoon"],
            subCategory: "Sandwiches",
            ingredients: ["Turkey", "Sliced Cheddar", "Bread w/ Butter", "Pickle"],
            sidesAllowed: 0,
            isAllergen: false,
        },

        // --- AFTERNOON MEALS (RICE MEALS) ---
        {
            id: 12,
            name: "Southwest Rice",
            categories: ["Afternoon"],
            subCategory: "Rice Meals",
            ingredients: ["Southwest Rice", "Chicken Tenders OR Ground Beef"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 13,
            name: "Chicken + Veggies",
            categories: ["Afternoon"],
            subCategory: "Rice Meals",
            ingredients: ["Rice", "Broccoli + Carrots", "Chicken"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 14,
            name: "Taco Bowls",
            categories: ["Afternoon"],
            subCategory: "Rice Meals",
            ingredients: [
                "Taco Meat",
                "Peppers, Onion, Corn",
                "Corn Tortilla Chips/Rice",
                "Cheese",
            ],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 15,
            name: "Hibachi",
            categories: ["Afternoon"],
            subCategory: "Rice Meals",
            ingredients: [
                "Rice",
                "Carrots",
                "Onion",
                "Chicken Tenders",
                "Zucchini",
                "Broccoli",
                "Yum Yum Sauce",
                "Teriyaki Sauce + Ginger, Onion, Garlic",
            ],
            sidesAllowed: 0,
            isAllergen: false,
        },

        // --- AFTERNOON MEALS (PLATTER MEALS) ---
        {
            id: 16,
            name: "Tender Meals",
            categories: ["Afternoon"],
            subCategory: "Platter Meals",
            ingredients: ["Grilled OR Fried Chicken"],
            sidesAllowed: 2,
            isAllergen: false,
        },
        {
            id: 17,
            name: "Burger Patties",
            categories: ["Afternoon"],
            subCategory: "Platter Meals",
            ingredients: ["Burger", "Sliced Cheddar"],
            sidesAllowed: 1,
            isAllergen: false,
        },
        {
            id: 18,
            name: "Salad",
            categories: ["Afternoon"],
            subCategory: "Platter Meals",
            ingredients: [
                "Lettuce",
                "Broccoli",
                "Cucumber",
                "Carrot",
                "Red Onion",
                "Tortilla Strips (optional)",
                "Ranch OR Italian",
                "Cheddar OR Mozzarella",
                "Meat Toppings (optional): Taco Meat OR Chicken",
            ],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 19,
            name: "Taco Plate",
            categories: ["Afternoon"],
            subCategory: "Platter Meals",
            ingredients: ["Taco Meat", "Tortillas OR Chips", "Rice", "Refried Beans"],
            sidesAllowed: 0,
            isAllergen: false,
        },

        // --- SNACKS ---
        {
            id: 20,
            name: "Granola Bars",
            categories: ["Snacky"],
            subCategory: "",
            ingredients: ["Granola Bars"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 21,
            name: "Chips",
            categories: ["Snacky"],
            subCategory: "",
            ingredients: ["Chips"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 22,
            name: "Pizza Rolls",
            categories: ["Snacky"],
            subCategory: "",
            ingredients: ["Pizza Rolls"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 23,
            name: "Cheez-Its",
            categories: ["Snacky"],
            subCategory: "",
            ingredients: ["Cheez-Its"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 24,
            name: "Peanut Butter + Crackers",
            categories: ["Snacky"],
            subCategory: "",
            ingredients: ["Peanut Butter", "Crackers"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 25,
            name: "Peanut Butter + Pretzels",
            categories: ["Snacky"],
            subCategory: "",
            ingredients: ["Peanut Butter", "Pretzels"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 26,
            name: "Peanut Butter + Apples",
            categories: ["Snacky"],
            subCategory: "",
            ingredients: ["Peanut Butter", "Apples"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 27,
            name: "Clio Yogurt Bar",
            categories: ["Snacky"],
            subCategory: "",
            ingredients: ["Clio Yogurt Bar"],
            sidesAllowed: 0,
            isAllergen: false,
        },

        // --- DESSERTS ---
        {
            id: 28,
            name: "Mini Pies",
            categories: ["Dessert"],
            subCategory: "",
            ingredients: ["Mini Pies"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 29,
            name: "Cookies",
            categories: ["Dessert"],
            subCategory: "",
            ingredients: ["Cookies"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 30,
            name: "Donuts",
            categories: ["Dessert"],
            subCategory: "",
            ingredients: ["Donuts"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 31,
            name: "Ice Cream",
            categories: ["Dessert"],
            subCategory: "",
            ingredients: ["Ice Cream"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 32,
            name: "Gummies",
            categories: ["Dessert"],
            subCategory: "",
            ingredients: ["Gummies"],
            sidesAllowed: 0,
            isAllergen: false,
        },
        {
            id: 33,
            name: "Wheat",
            categories: ["Morning"],
            subCategory: "",
            ingredients: ["Wheat"],
            sidesAllowed: 0,
            isAllergen: true,
        },
    ]);

    db.sides.bulkAdd([
        // --- BREAKFAST SIDES ---
        {
            id: 1,
            name: "Diced Potatoes",
            categories: ["Morning"],
            isAllergen: false,
        },
        {
            id: 2,
            name: "Hashbrown Patties",
            categories: ["Morning"],
            isAllergen: false,
        },
        {
            id: 3,
            name: "Fruit Cup",
            categories: ["Morning"],
            isAllergen: false,
        },
        {
            id: 4,
            name: "Cooked Apples",
            categories: ["Morning"],
            isAllergen: false,
        },

        // --- LUNCH / DINNER SIDES ---
        {
            id: 5,
            name: "Green Beans",
            categories: ["Afternoon"],
            isAllergen: false,
        },
        {
            id: 6,
            name: "Buttered Corn",
            categories: ["Afternoon"],
            isAllergen: false,
        },
        {
            id: 7,
            name: "Garlic Butter Potatoes",
            categories: ["Afternoon"],
            isAllergen: false,
        },
        {
            id: 8,
            name: "Steamed Veg Mix",
            categories: ["Afternoon"],
            isAllergen: false,
        },
        {
            id: 9,
            name: "Steamed Broccoli + Carrots",
            categories: ["Afternoon"],
            isAllergen: false,
        },
        {
            id: 10,
            name: "Steamed Broccoli",
            categories: ["Afternoon"],
            isAllergen: false,
        },
        {
            id: 11,
            name: "Garlic Bread",
            categories: ["Afternoon"],
            isAllergen: false,
        },
        {
            id: 12,
            name: "Mashed Potatoes",
            categories: ["Afternoon"],
            isAllergen: false,
        },
        {
            id: 13,
            name: "Side Salad",
            categories: ["Afternoon"],
            isAllergen: false,
        },
    ]);
});

// Open database connection
db.open().catch((err) => {
    console.error("Failed to open database:", err);
});
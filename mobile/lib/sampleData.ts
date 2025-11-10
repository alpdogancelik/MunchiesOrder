export const sampleRestaurants = [
    {
        id: 1,
        name: "Campus Burger",
        cuisine: "Fast Food",
        rating: 4.6,
        reviewCount: 124,
        deliveryTime: "20-30",
        deliveryFee: "19.90",
        imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=60",
    },
    {
        id: 2,
        name: "Mediterranean Bites",
        cuisine: "Mediterranean",
        rating: 4.8,
        reviewCount: 89,
        deliveryTime: "15-25",
        deliveryFee: "14.90",
        imageUrl: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=60",
    },
];

export const sampleCategories: Record<number, { id: number; name: string }[]> = {
    1: [
        { id: 11, name: "Burgers" },
        { id: 12, name: "Fries & Sides" },
    ],
    2: [
        { id: 21, name: "Bowls" },
        { id: 22, name: "Wraps" },
    ],
};

export const sampleAddresses = [
    {
        id: 501,
        title: "Dorm A - Room 204",
        addressLine1: "Campus Residences, Block A",
        addressLine2: "Room 204",
        city: "Kalkanlı",
        country: "TRNC",
        isDefault: true,
    },
    {
        id: 502,
        title: "Library",
        addressLine1: "Main Library, Study Room 3",
        addressLine2: null,
        city: "Kalkanlı",
        country: "TRNC",
        isDefault: false,
    },
];

export const sampleOrders = [
    {
        id: 9001,
        restaurantId: 1,
        restaurant: sampleRestaurants[0],
        status: "preparing",
        total: "179.90",
        paymentMethod: "card",
        updatedAt: new Date().toISOString(),
        orderItems: [
            { name: "Classic Burger", quantity: 1 },
            { name: "Fries", quantity: 1 },
        ],
    },
    {
        id: 9002,
        restaurantId: 2,
        restaurant: sampleRestaurants[1],
        status: "delivered",
        total: "129.90",
        paymentMethod: "cash",
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        orderItems: [
            { name: "Halloumi Wrap", quantity: 1 },
        ],
    },
    {
        id: 9003,
        restaurantId: 1,
        restaurant: sampleRestaurants[0],
        status: "ready",
        total: "199.90",
        paymentMethod: "card",
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        orderItems: [
            { name: "Spicy Chick'n Burger", quantity: 1 },
            { name: "Mozzarella Sticks", quantity: 1 },
        ],
    },
    {
        id: 9004,
        restaurantId: 2,
        restaurant: sampleRestaurants[1],
        status: "canceled",
        total: "89.90",
        paymentMethod: "card",
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        orderItems: [
            { name: "Falafel Bowl", quantity: 1 },
        ],
    },
];

export const sampleOwnerRestaurants = [
    {
        id: 1,
        name: "Campus Burger",
        description: "Legendary burger joint on campus.",
        cuisine: "Fast Food",
        deliveryFee: "19.90",
        deliveryTime: "20-30",
        imageUrl: sampleRestaurants[0].imageUrl,
        isActive: true,
    },
];

export const sampleRestaurantOrders = [
    {
        id: 9100,
        customerName: "Mert Kaya",
        status: "pending",
        total: "129.90",
        paymentMethod: "card",
        address: "Dorm A, Room 204",
        orderItems: [
            { name: "Classic Burger", quantity: 1 },
            { name: "Fries", quantity: 1 },
        ],
    },
    {
        id: 9101,
        customerName: "Selin Aydin",
        status: "preparing",
        total: "99.90",
        paymentMethod: "cash",
        address: "Library Study Room",
        orderItems: [
            { name: "Spicy Chick'n Burger", quantity: 1 },
        ],
    },
];

export const sampleCourierList = [
    { id: "courier_1", name: "Mehmet", vehicle: "Bike", status: "Available" },
    { id: "courier_2", name: "Ayşe", vehicle: "Motorbike", status: "Delivering" },
];

export const sampleMenu: Record<number, any[]> = {
    1: [
        {
            id: 111,
            restaurantId: 1,
            name: "Classic Burger",
            description: "Beef patty with cheddar and house sauce.",
            price: "149.90",
            imageUrl: "https://images.unsplash.com/photo-1551782450-17144c3fa086?auto=format&fit=crop&w=800&q=60",
        },
        {
            id: 112,
            restaurantId: 1,
            name: "Spicy Chick'n Burger",
            description: "Crispy chicken, spicy mayo, pickles.",
            price: "159.90",
            imageUrl: "https://images.unsplash.com/photo-1608039829574-7d0174b8cd48?auto=format&fit=crop&w=800&q=60",
        },
    ],
    2: [
        {
            id: 211,
            restaurantId: 2,
            name: "Falafel Bowl",
            description: "Falafel, hummus, roasted veggies.",
            price: "129.90",
            imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60",
        },
        {
            id: 212,
            restaurantId: 2,
            name: "Halloumi Wrap",
            description: "Grilled halloumi, greens, tahini dressing.",
            price: "119.90",
            imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=60",
        },
    ],
};

// ===================== FLASHFOOD DEMO ACCOUNTS =====================
// Add another account by copying one of these objects and changing the id/name/avatar.
// Parents use childId to point at the child whose cart/history/settings they manage.
export const ACCOUNTS = {
  parent1: {
    id: 'parent1', role: 'parent', name: 'Peter John Quimpan', avatar: 'Peter.jpeg',
    schoolId: 'P-22-3032-911', linkedSchoolIds: ['22-3032-911'], childId: 'student1'
  },
  student1: {
    id: 'student1', role: 'student', name: 'Joril Mero Abaincia', avatar: 'student-avatar.jpg', password: 'abaincia.123456',
    schoolId: '22-3032-911', grade: '11-Benevolence',
    allergies: ['Shellfish', 'Finfish'],
    restrictions: ['spicy'],
    favorites: ['chicken', 'siomai'],
    balance: 67,
    cart: [],
    history: [
      {foodId:'chicken', date:'2026-02-20', time:'12:10 PM'},
      {foodId:'siomai', date:'2026-02-20', time:'12:31 PM'},
      {foodId:'chicken', date:'2026-02-19', time:'12:04 PM'},
      {foodId:'chicken', date:'2026-02-18', time:'12:05 PM'},
      {foodId:'noodles', date:'2026-02-19', time:'11:43 AM'},
      {foodId:'chicken', date:'2026-02-17', time:'12:02 PM'},
      {foodId:'siomai', date:'2026-02-16', time:'12:30 PM'},
      {foodId:'noodles', date:'2026-02-15', time:'11:48 AM'},
    ]
  },
  parent3: {
    id: 'parent3', role: 'parent', name: 'Prince Andrew Bolotaolo', avatar: 'Prince.jpeg',
    schoolId: 'P-26-5003-304', linkedSchoolIds: ['26-5003-304'], childId: 'student3'
  },
  student3: {
    id: 'student3', role: 'student', name: 'Trent Sejismundo', avatar: 'Trent.jpeg', password: 'sejismundo.123456',
    schoolId: '26-5003-304', grade: '11-Benevolence', allergies: [], restrictions: [],
    favorites: ['bbq'], balance: 120, cart: [], history: [], settings: {notifications:true,orderUpdates:true,showAllergens:true}
  },
  parent4: {
    id: 'parent4', role: 'parent', name: 'Shanelle Kaye Sulapas', avatar: 'Shanelle.jpeg',
    schoolId: 'P-16-0087-898', linkedSchoolIds: ['16-0087-898'], childId: 'student4'
  },
  student4: {
    id: 'student4', role: 'student', name: 'Shaziel Abella', avatar: 'Shaziel.jpeg', password: 'abella.123456',
    schoolId: '16-0087-898', grade: '11-Benevolence', allergies: [], restrictions: [],
    favorites: ['rolls'], balance: 100, cart: [], history: []
  }
};

export const FOODS = [
 {id:'chicken',name:'Fried Chicken',price:60,img:'fried-chicken.jpeg',canteen:'Main Canteen',tag:'Best seller',desc:'Crispy fried chicken with a savory, golden coating.',allergens:['Chicken'],nutrition:{protein:'high',vegetables:false,wholeGrain:false,fried:true,highSodium:true,balanced:false}},
 {id:'dumplings',name:'Chicken Dumplings',price:45,img:'Chicken_Dumplings.jpeg',canteen:'Main Canteen',tag:'Popular',desc:'Steamed dumplings with a warm, flavorful filling.',allergens:['Chicken','Gluten'],nutrition:{protein:'high',vegetables:false,wholeGrain:false,fried:false,highSodium:true,balanced:false}},
 {id:'noodles',name:'Noodle Soup',price:50,img:'noodles-soup.jpeg',canteen:'Main Canteen',tag:'Comfort food',desc:'Warm noodles with vegetables and savory broth.',allergens:['Finfish','Gluten'],nutrition:{protein:'medium',vegetables:true,wholeGrain:false,fried:false,highSodium:true,balanced:false}},
 {id:'spicy',name:'Spicy Noodles',price:55,img:'noodles.jpeg',canteen:'Main Canteen',tag:'Spicy',desc:'Stir-fried noodles with vegetables and a chili kick.',allergens:['Gluten'],nutrition:{protein:'medium',vegetables:true,wholeGrain:false,fried:true,highSodium:true,balanced:false}},
 {id:'bbq',name:'BBQ Skewers',price:40,img:'bbq.jpeg',canteen:'Small Canteen',tag:'Quick pick',desc:'Grilled skewers, perfect for a short break.',allergens:['Pork'],nutrition:{protein:'high',vegetables:false,wholeGrain:false,fried:false,highSodium:true,balanced:false}},
 {id:'siomai',name:'Spicy Siomai',price:40,img:'siomai.jpeg',canteen:'Small Canteen',tag:'3 for ₱40',desc:'Steamed siomai with a spicy sauce.',allergens:['Pork','Shellfish'],nutrition:{protein:'high',vegetables:false,wholeGrain:false,fried:false,highSodium:true,balanced:false},special:'Deliver to Room 467, simply choose the siomai sauce and the siomai.'},
 {id:'rolls',name:'Spring Rolls',price:30,img:'spring-rolls.jpeg',canteen:'Small Canteen',tag:'Crispy',desc:'Crispy vegetable spring rolls with dipping sauce.',allergens:['Gluten'],nutrition:{protein:'medium',vegetables:true,wholeGrain:false,fried:true,highSodium:true,balanced:false}},
 {id:'stew',name:'Chicken Stew',price:60,img:'stew.jpeg',canteen:'Small Canteen',tag:'Home-style',desc:'Tender chicken in a rich, savory stew.',allergens:['Chicken'],nutrition:{protein:'high',vegetables:true,wholeGrain:false,fried:false,highSodium:false,balanced:true}},
 {id:'sandwich',name:'Chicken Sandwich',price:50,img:'chicken-sandwich.jpeg',canteen:'Main Canteen',tag:'Quick pick',desc:'Toasted sandwich with seasoned chicken filling.',allergens:['Chicken','Gluten','Dairy'],nutrition:{protein:'high',vegetables:false,wholeGrain:true,fried:false,highSodium:true,balanced:false}}
];

export const DEFAULT_STORE = Object.fromEntries(
  Object.entries(ACCOUNTS).map(([id,a]) => [id, {...a, settings:{notifications:true,orderUpdates:true,showAllergens:true,...(a.settings||{})}, allergies:[...(a.allergies||[])], restrictions:[...(a.restrictions||[])], favorites:[...(a.favorites||[])], cart:[...(a.cart||[])], history:[...(a.history||[])]}])
);

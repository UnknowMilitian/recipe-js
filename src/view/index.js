import config from "../config/index";
const mealsEl = document.getElementById("meals");
const favMeals = document.getElementById("fav-meals");

// Search Section
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const resp = await fetch(`${config}random.php`);
  const responseData = await resp.json();
  const randomMeal = responseData.meals[0];

  addMeal(randomMeal, true);
}

async function getMealById(id) {
  const resp = await fetch(`${config}lookup.php?i=` + id);
  const respData = await resp.json();
  const meal = respData.meals[0];

  return meal;
}

async function getMealsBySearch(term) {
  const resp = await fetch(`${config}search.php?s=${term}`);

  const resData = await resp.json();
  const meals = resData.meals;

  return meals;
}

function addMeal(mealData, random = false) {
  console.log(mealData);

  const meal = document.createElement("div");
  meal.classList.add("col-12", "col-sm-6", "col-lg-3", "mb-3");

  meal.innerHTML = `
      <div class="card recipes__card rounded-4">
        <img
          class="card-img-top rounded-4"
          src="${mealData.strMealThumb}"
          alt="${mealData.strMeal}"
        />
        <div class="card-body py-4">
          <h5 class="card-title fs-4">${mealData.strMeal}</h5>
          <a
            class="btn recipes__btn rounded-1 w-full d-block text-uppercase fw-bold"
            >Details</a
          >
        </div>
        <button class="btn bg-white text-danger heart__btn">
          <i class="bi bi-heart-fill"></i>
        </button>
      </div>
    `;

  const btn = meal.querySelector(".card button.heart__btn");

  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealLS(mealData.idMeal);
      btn.classList.add("active");
    }

    fetchFavMeals();
  });
  meals.appendChild(meal);
}

function addMealLS(mealID) {
  const mealIDs = getMealsLS();

  localStorage.setItem("mealsIDs", JSON.stringify([...mealIDs, mealID]));
}

function removeMealLS(mealID) {
  const mealIDs = getMealsLS();

  localStorage.setItem(
    "mealsIDs",
    JSON.stringify(mealIDs.filter((id) => id !== mealID))
  );
}

function getMealsLS() {
  const mealIDs = JSON.parse(localStorage.getItem("mealsIDs"));

  return mealIDs === null ? [] : mealIDs;
}

async function fetchFavMeals() {
  favMeals.innerHTML = ``;

  const mealIDs = getMealsLS();

  const meals = [];

  for (let i = 0; i < mealIDs.length; i++) {
    const mealID = mealIDs[i];
    const meal = await getMealById(mealID);

    meals.push(meal);

    addMealFav(meal);
  }
}

function addMealFav(mealData, random = false) {
  const favMeal = document.createElement("div");
  favMeal.classList.add("col-12", "col-sm-6", "col-md-4", "col-xl-2");

  favMeal.innerHTML = `
      <div class="card">
        <img src="${mealData.strMealThumb}" class="card-img-top" alt="${mealData.strMeal}" />
        <div class="card-body">
          <h6 class="card-title">${mealData.strMeal}</h6>
          <button>See recipes</button>
        </div>
        <button id="favMealHeart" class="btn bg-white text-danger heart__btn">
          <i class="bi bi-heart-fill"></i>
        </button>
      </div>
    `;

  const btn = favMeal.querySelector("#favMealHeart");
  btn.addEventListener("click", () => {
    removeMealLS(mealData.idMeal);

    fetchFavMeals();
  });

  favMeals.appendChild(favMeal);
}

searchBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  // Clean The Container
  mealsEl.innerHTML = "";
  const search = searchTerm.value;

  const meals = await getMealsBySearch(search);

  if (meals) {
    meals.forEach((meal) => {
      addMeal(meal);
      searchTerm.value = ''
    });
  }
});

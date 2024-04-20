import config from "../config/index";
import Splide from "@splidejs/splide";
import "@splidejs/splide/css/sea-green";

const meals = document.getElementById("meals");
const favorites = document.getElementById("favorites-ul");

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
  const meals = await fetch(`${config.url}search.php?s=` + term);
  console.log(meals);
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
  const mealIDs = getMealsLS();

  const meals = [];

  for (let i = 0; i < mealIDs.length; i++) {
    const mealID = mealIDs[i];
    const meal = await getMealById(mealID);

    addMealFav(meal);
  }
}

function addMealFav(mealData) {
  console.log(mealData);

  const favorite = document.createElement("li");
  favorite.classList.add("splide__slide");

  favorite.innerHTML = `
    <div class="favorites__card card rounded-4">
      <img
        class="card-img-top rounded-4"
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
      />
      <div class="card-body py-4">
        <h5 class="card-title fs-4">
          ${mealData.strMeal}
        </h5>
      </div>
      <button class="btn bg-white text-danger heart__btn">
        <i class="bi bi-heart-fill"></i>
      </button>
    </div>
  `;

  const btn = favorite.querySelector(".card button.heart__btn");

  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealLS(mealData.idMeal);
      btn.classList.add("active");
    }
  });

  // Assuming `favorites` is the container for the Splide slider
  favorites.appendChild(favorite);

  // Reinitialize the Splide slider
  const splide = new Splide(".splide", {
    type: "loop",
    perPage: 4,
    perMove: 1,
    breakpoints: {
      990: {
        perPage: 2,
      },
      750: {
        perPage: 1,
      },
    },
  }).mount();
}

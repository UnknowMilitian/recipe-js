import config from "../config";

document.addEventListener("DOMContentLoaded", function () {
  const mealsEl = document.getElementById("meals");
  const favMeals = document.getElementById("fav-meals");

  // Search Section
  const searchTerm = document.getElementById("search-term");
  const searchBtn = document.getElementById("search");

  // Popup
  const modal = document.getElementById("meal-info");
  const modalClose = document.querySelector(".modal-close");
  const mealInfoEl = document.querySelector(".info");

  getRandomMeals(6)
    .then((randomMeals) => {
      randomMeals.forEach((meal) => {
        addMeal(meal, true);
      });
    })
    .catch((error) => {
      console.error("Error fetching random meals:", error);
    });
  fetchFavMeals();

  async function getRandomMeals(numberOfMeals) {
    const meals = [];
    for (let i = 0; i < numberOfMeals; i++) {
      const resp = await fetch(`${config}random.php`);
      const responseData = await resp.json();
      const randomMeal = responseData.meals[0];
      meals.push(randomMeal);
    }
    return meals;
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
    const meal = document.createElement("div");
    meal.classList.add("col-12", "col-sm-6", "col-lg-3", "mb-3");

    const isFavorite = getMealsLS().includes(mealData.idMeal);

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
            id="see-recipes"
            class="btn recipes__btn rounded-1 w-full d-block text-uppercase fw-bold"
            >See recipes</a
          >
        </div>
        <button class="btn bg-white text-danger heart__btn ${
          isFavorite ? "active" : ""
        }">
          <i class="bi bi-heart-fill"></i>
        </button>
      </div>
    `;

    const btn = meal.querySelector(".card button.heart__btn");

    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) {
        removeMealLS(mealData.idMeal);
        btn.classList.remove("active");
        // If the meal is in the "Favorites" section, remove it visually
        if (!random) {
          const favMealToRemove = favMeals.querySelector(
            `[data-meal-id="${mealData.idMeal}"]`
          );
          if (favMealToRemove) {
            favMeals.removeChild(favMealToRemove);
          }
        }
      } else {
        addMealLS(mealData.idMeal);
        btn.classList.add("active");
      }

      fetchFavMeals();
    });

    const modalBtn = meal.querySelector("#see-recipes");
    modalBtn.addEventListener("click", () => {
      showMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
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
    }

    meals.forEach((meal) => {
      addMealFav(meal);
    });
  }

  function addMealFav(mealData, random = false) {
    const favMeal = document.createElement("div");
    favMeal.classList.add("col-12", "col-sm-6", "col-md-4", "col-xl-2");

    favMeal.innerHTML = `
      <div class="card">
        <img src="${mealData.strMealThumb}" class="card-img-top" alt="${mealData.strMeal}" />
        <div class="card-body">
          <h6 class="card-title">${mealData.strMeal}</h6>
          <button id="see-recipes" class="btn recipes__btn">See recipes</button>
        </div>
        <button class="btn bg-white text-danger heart__btn">
          <i class="bi bi-heart-fill"></i>
        </button>
      </div>
    `;

    // Set a data attribute with the meal ID for easier identification
    favMeal.setAttribute("data-meal-id", mealData.idMeal);

    const modalBtn = favMeal.querySelector("#see-recipes");
    modalBtn.addEventListener("click", () => {
      showMealInfo(mealData);
    });

    favMeals.appendChild(favMeal);

    // Attach event listener for heart button click
    const btn = favMeal.querySelector(".card button.heart__btn");

    btn.addEventListener("click", () => {
      removeMealLS(mealData.idMeal); // Remove the meal from local storage
      favMeals.removeChild(favMeal); // Remove the meal from the favorites section visually
      // Update the heart button state in the "All Recipes" section
      const allRecipeMeal = mealsEl.querySelector(
        `[data-meal-id="${mealData.idMeal}"]`
      );
      if (allRecipeMeal) {
        const allRecipeBtn = allRecipeMeal.querySelector(
          ".card button.heart__btn"
        );
        if (allRecipeBtn) {
          allRecipeBtn.classList.remove("active");
        }
      }
    });
  }

  function showMealInfo(mealData) {
    // Clean it up
    mealInfoEl.innerHTML = "";

    // Move the declaration of mealEl here
    const mealEl = document.createElement(`div`);

    // Ingredients
    const ingredients = [];

    for (let i = 1; i < 20; i++) {
      if (mealData["strIngredient" + i]) {
        ingredients.push(
          `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
        );
      } else {
        break;
      }
    }

    mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" />
    <div class="info">
        <p>
            ${mealData.strInstructions}
        </p>

        <h3>Ingredients</h3>

        <ul>
            ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
        </ul>
    </div>
    `;

    mealInfoEl.appendChild(mealEl);

    modal.classList.add("active");

    // Add event listener to close popup when close button is clicked
    modalClose.addEventListener("click", () => {
      closeModal();
    });

    // Add event listener to close popup when clicking outside the popup area
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  function closeModal() {
    modal.classList.remove("active");
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
        searchTerm.value = "";
      });
    }
  });
});

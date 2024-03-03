document.addEventListener("DOMContentLoaded", () => {
  var successAlert = document.getElementById("successAlert");
  if (successAlert) {
    setTimeout(() => {
      successAlert.classList.add("fade");
      setTimeout(() => {
        successAlert.remove();
      }, 1000);
    }, 2000);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchQuery");
  const searchButton = document.getElementById("searchButton");

  // Add event listener to input
  searchInput.addEventListener("input", () => {
    // Enable/disable search button based on input value
    if (searchInput.value.trim() !== "") {
      searchButton.removeAttribute("disabled");
    } else {
      searchButton.setAttribute("disabled", "disabled");
    }
  });

  // Optional: Disable search button on page load
  if (searchInput.value.trim() === "") {
    searchButton.setAttribute("disabled", "disabled");
  }
});

const successSpan = document.getElementById("successSpan");

if (successAlert) {
  if (window.innerWidth < 992) {
    successSpan.classList.remove("invisible");
    setTimeout(() => {
      successSpan.classList.add("invisible");
    }, 3000);
  } else {
    successSpan.classList.add("invisible");
  }
}

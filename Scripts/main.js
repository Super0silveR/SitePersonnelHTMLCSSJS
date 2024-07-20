let workCardElement = document.querySelectorAll(".workCard");

let removeActiveClasses = () => {
  workCardElement.forEach((workCard) => {
    workCard.classList.remove("active");
  });
};

console.log(workCardElement);

workCardElement.forEach((workCard) => {
  workCard.addEventListener("mouseover", () => {
    removeActiveClasses();
    workCard.classList.add("active");
  });
});

function burgerMenu() {
  var menu = document.getElementById("optionmenu");
  if (menu.style.display === "grid") {
    menu.style.display = "none";
  } else {
    menu.style.display = "grid";
  }
}

function closeOptionMenu() {
  var menu = document.getElementById("optionmenu");
  menu.style.display = "none";
}

function openWorkCard(id) {
  var card = document.getElementById(id);
}

function closeWorkCard(id) {
  var card = document.getElementById(id);
}

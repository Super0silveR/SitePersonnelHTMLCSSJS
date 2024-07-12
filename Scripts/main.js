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

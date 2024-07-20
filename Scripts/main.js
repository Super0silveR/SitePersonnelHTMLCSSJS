let workCardElement = document.querySelectorAll(".workCard");
let projectTagsElement = document.querySelectorAll(".projectTags a");
let projectCards = document.querySelectorAll(".projectCard");

projectCards.forEach((pCard) => {
  console.log(pCard.classList);
});

projectTagsElement.forEach((tag) => {
  var count = 0;
  projectCards.forEach((pCard) => {
    if (pCard.id == tag.id) {
      count = count + 1;
    }
  });
  tag.innerHTML = tag.innerHTML + " (" + count + ")";
});

let removeActiveWorkCard = () => {
  workCardElement.forEach((workCard) => {
    workCard.classList.remove("active");
  });
};

workCardElement.forEach((workCard) => {
  if (screen.width > 1100) {
    workCard.addEventListener("mouseover", () => {
      removeActiveWorkCard();
      workCard.classList.add("active");
    });
  }
});

let removeActiveProjectTag = () => {
  projectTagsElement.forEach((tag) => {
    tag.classList.remove("active");
  });
};

let displayAllProjects = () => {
  projectCards.forEach((pCard) => {
    pCard.classList.remove("hidden");
  });
};

let displayZeroProjects = () => {
  projectCards.forEach((pCard) => {
    pCard.classList.add("hidden");
  });
};

let displayProjectsByTag = (tag) => {
  projectCards.forEach((pCard) => {
    if (pCard.id === tag) {
      pCard.classList.remove("hidden");
    }
  });
};

function clickTagHandler(tagid) {
  var tag = document.getElementById(tagid);
  if (tag.classList.contains("active")) {
    tag.classList.remove("active");
    displayAllProjects();
  } else {
    removeActiveProjectTag();
    displayZeroProjects();
    displayProjectsByTag(tagid);
    tag.classList.add("active");
  }
  return;
}

function projectSelectHandler(tagid) {
  projectCards.forEach((pCard) => {
    if (project_tag_dict[tagid].contains(pCard.classList)) {
      return false;
    }
  });
}

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

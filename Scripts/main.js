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
  workCard.addEventListener("mouseover", () => {
    removeActiveWorkCard();
    workCard.classList.add("active");
  });

  workCard.addEventListener("mouseout", () => {
    workCard.classList.remove("active");
  });
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

//#region Translation

/* Work in Progress */

const language = {
  en: {
    navbar: {
      home: "Home",
      workExperience: "Work Experience",
      projects: "Projects",
      contact: "Contact",
    },
    burgerMenu: {
      home: "Home",
      workExperience: "Work Experience",
      projects: "Projects",
      contact: "Contact",
    },
    about: { intro: "Hi I'm Elias!", bio: "I'm a Software Engineer" },
    workCards: {
      oxfam: {
        desc: "Jun 2019 - Aug 2019 | Administration Associate <br />Developed and delivered a comprehensive training program for over 50 employees and staff members, empowering them with essential skills to utilize Box effectively. I promptly investigated and resolved IT issues, ensuring uninterrupted workflow and minimizing downtime. Additionally, I conducted extensive research to identify and evaluate communication software solutions that met strict security and compliance requirements.",
        tags: { box: "Box" },
      },
      innovapost1:
        "Sep 2022 - Dec 2022 | Data Analytics CO-OP<br />Identified and rectified over 20 failing Teradata jobs, managing datasets of up to 100 million entries during a version migration process. I crafted and implemented three comprehensive test plans for Teradata jobs, meticulously aligning with company standards and precise workload estimations. Additionally, I effectively remediated failing jobs through clear communication with fellow developers and close collaboration with the Quality Assurance team.",
      innovapost2: "",
      capstone: "",
    },
  },
  fr: {},
  es: {},
  jp: {},
};

//#endregion

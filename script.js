const selectedDateText = document.getElementById("selectedDate");
const isMobile = window.matchMedia("(max-width: 768px)").matches;

function saveToLocalStorage(data) {
  return localStorage.setItem("moodData", JSON.stringify(data));
}
function loadFromLocalStorage() {
  return JSON.parse(localStorage.getItem("moodData"));
}

// initialy sets dummy data as below if localStorage data is Empty
let moodData = loadFromLocalStorage() || [
  { title: "🥳", id: "Excited", start: "2025-03-20" },
  { title: "😊", id: "Happy", start: "2025-03-18" },
  { title: "🥳", id: "Excited", start: "2025-03-15" },
  { title: "😕", id: "Confused", start: "2025-02-26" },
  { title: "🥳", id: "Excited", start: "2025-02-23" },
];

let moodDataDisplay = "";

// This is modify data sent to display on calender (for mobile only emoji will be displayed)
function moodDataModification() {
  moodDataDisplay = isMobile
    ? moodData
    : moodData.map(({ title, id, start }) => ({
        title: `${title} ${id}`,
        start,
      }));
}

let selectedDate = new Date().toISOString().split("T")[0];

// Below function is just used to converts date format from "2025-03-07" to "07 Mar 2025"
function updateDateText(date) {
  const dateObject = new Date(date);
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(dateObject);
  return formattedDate;
}

// this part is for initial render of FullCalendar library along with updating the selected date on click of dates in calender
const calenderInitialRender = (data) => {
  loadFromLocalStorage();
  let calendarEl = document.getElementById("calendar");
  const qtsDisplay = document.getElementById("qtsDisplay");
  let calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    selectable: true,
    editable: true,
    events: data,
    validRange: {
      end: new Date(), // Disables future dates
    },
    dateClick: function (info) {
      selectedDate = info.dateStr;
      if (isNaN(info.dayEl.innerText)) {
        qtsDisplay.innerText =
          selectedDate === new Date().toISOString().split("T")[0]
            ? "How are you feeling today?"
            : `Do you want to modify your mood entry for ${updateDateText(
                selectedDate
              )}?`;
      } else {
        qtsDisplay.innerText =
          selectedDate === new Date().toISOString().split("T")[0]
            ? "How are you feeling today?"
            : `Would you like to add how you felt on ${updateDateText(
                selectedDate
              )}?`;
      }
    },
    eventClick: function (info) {
      if (confirm("Delete this mood?")) {
        const clickedDate = info.event.start.toLocaleDateString("en-CA"); // Get correct date format "MMMM-YYY-DD"

        info.event.remove();

        moodData = moodData.filter((item) => item.start !== clickedDate);

        saveToLocalStorage(moodData);
        renderMoodTimeLine();
      }
    },
  });

  calendar.setOption("height", "auto"); // Adjusts height automatically
  moodDataModification();
  renderMoodTimeLine();
  calendar.render();
};
document.addEventListener(
  "DOMContentLoaded",
  calenderInitialRender(moodDataDisplay)
);

// Below funtion is used to update/edit the moodData
function updateMoodDataAtEdit() {
  const modeSelectionEmojies = document.querySelectorAll(
    "#moodSelectionContainer button"
  );

  modeSelectionEmojies.forEach((button) => {
    button.addEventListener("click", (e) => {
      const emoji = e.target.innerText;
      const text = e.target.id;

      const moodToBeEdited = moodData.find(
        (item) => item.start === selectedDate
      );

      // If moodToBeEdited is true(moodToBeEdited not equal to empty) then we need to update the title of selected moodData
      // else we need to add the newMood to moodData

      if (moodToBeEdited) {
        moodToBeEdited.title = emoji;
        moodToBeEdited.id = text;
        moodDataModification();
        saveToLocalStorage(moodData);
        renderMoodTimeLine();
      } else {
        const newMood = { title: emoji, id: text, start: selectedDate };
        moodData.push(newMood);
        moodDataModification();
        saveToLocalStorage(moodData);
        renderMoodTimeLine();
      }

      calenderInitialRender(moodDataDisplay);
    });
  });

  calenderInitialRender(moodDataDisplay);
}

updateMoodDataAtEdit();

function renderMoodTimeLine() {
  let moodDataSortedByDate = moodData.sort(
    (latestMood, olderMood) =>
      new Date(olderMood.start) - new Date(latestMood.start)
  );
  const lastFiveMoods = moodDataSortedByDate.slice(0, 5);

  const moodTimeLineUl = document.getElementById("moodTimeLineUl");
  moodTimeLineUl.innerHTML = "";

  if (lastFiveMoods.length <= 0) {
    moodTimeLineUl.innerHTML += `
      <li class="flex items-center justify-center bg-gray-50 p-2 rounded-lg">
        You haven't recorded any moods yet.
      </li>
    `;
  } else {
    lastFiveMoods.forEach((item) => {
      // console.log(updateDateText(item.start))
      const date = new Date(item.start);
      const day = date.getDate().toString().padStart(2, "0"); // Ensures two-digit day
      const month = date.toLocaleString("en-US", { month: "short" }); // Short month name
      const year = date.getFullYear().toString().slice(-2); // Extracts last two digits of year

      const formattedDate = `${day}-${month}-${year}`;

      if (isMobile) {
        moodTimeLineUl.innerHTML += `
        <li class="flex flex-col items-center justify-center bg-gray-50 p-1 rounded-lg h-20">
          <span class="text-2xl leading-none h-8 flex items-center">${item.title.trim()}</span>
          <span class="text-[10px] text-nowrap font-mono">${formattedDate}</span>
        </li>
      `;
      } else {
        moodTimeLineUl.innerHTML += `
                <li class="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                  <span> ${updateDateText(item.start)} </span>
                  <span class="text-2xl"> ${item.title} </span>
                </li>
              `;
      }
    });
  }
}

// moodTimeLineUl.innerHTML += `
//         <li class="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
//           <span> ${updateDateText(item.start)} </span>
//           <span class="text-2xl"> ${item.title} </span>
//         </li>
//       `;

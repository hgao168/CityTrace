const places = [
  {
    id: "centraal",
    time: "09:00",
    title: "Amsterdam Centraal",
    subtitle: "Begin at the city's gateway on the water",
    category: "City Landmark",
    duration: "20 min",
    walk: "Starting point",
    distance: "0 km",
    status: "done",
    position: { left: 15.6, top: 72.7 },
    color: "#607f78",
    image:
      "linear-gradient(165deg, transparent 35%, #b75a3d 36% 52%, transparent 53%), linear-gradient(20deg, #668c85 0 30%, #d9b58c 31% 62%, #d9d0b6 63%)",
    story:
      "Built in the late 19th century, this Neo-Renaissance station forms a grand gateway into the city. It stands on three artificial islands supported by thousands of wooden piles and reshaped Amsterdam's relationship with its harbor.",
  },
  {
    id: "dam",
    time: "09:35",
    title: "Dam Square",
    subtitle: "Where the city began",
    category: "Historic Square",
    duration: "35 min",
    walk: "9 min walk",
    distance: "0.7 km",
    status: "active",
    position: { left: 32.8, top: 49.6 },
    color: "#a2694d",
    image:
      "linear-gradient(90deg, transparent 18%, #cfa47d 19% 55%, transparent 56%), linear-gradient(160deg, #778a83 0 45%, #dbc5a9 46%)",
    story:
      "In the 13th century, a dam was built across the Amstel River, giving the city its name. Today, the Royal Palace, National Monument, and old commercial streets still reveal how trade, power, and public life converged here.",
  },
  {
    id: "begijnhof",
    time: "10:30",
    title: "Begijnhof",
    subtitle: "A quiet courtyard hidden in the city center",
    category: "Hidden Courtyard",
    duration: "30 min",
    walk: "11 min walk",
    distance: "1.5 km",
    status: "upcoming",
    position: { left: 52.4, top: 53.1 },
    color: "#7c8e6d",
    image:
      "linear-gradient(100deg, transparent 32%, #4d6659 33% 40%, transparent 41%), linear-gradient(25deg, #5d7e6d 0 35%, #c99c77 36% 67%, #d8ccad 68%)",
    story:
      "This courtyard was once home to the Beguines, religious women who lived, worked, and cared for the sick without formally joining a convent. It also contains one of Amsterdam's few surviving medieval wooden houses.",
  },
  {
    id: "canal",
    time: "11:25",
    title: "Nine Streets & Canal Belt",
    subtitle: "Follow the curves of the Golden Age",
    category: "World Heritage",
    duration: "60 min",
    walk: "8 min walk",
    distance: "2.1 km",
    status: "upcoming",
    position: { left: 67.4, top: 32.3 },
    color: "#638699",
    image:
      "linear-gradient(75deg, transparent 47%, #aad0d2 48% 58%, transparent 59%), linear-gradient(155deg, #607b76 0 42%, #b36f52 43% 62%, #d5bc92 63%)",
    story:
      "The 17th-century canal expansion organized waterworks, homes, and commerce into elegant concentric rings. The tall, narrow canal houses were not merely an aesthetic choice; they also reflect taxes once based on the width of a waterfront facade.",
  },
  {
    id: "jordaan",
    time: "13:30",
    title: "Jordaan Lunch Walk",
    subtitle: "Taste local life in the old artisans' quarter",
    category: "Neighborhood Life",
    duration: "75 min",
    walk: "13 min walk",
    distance: "3.2 km",
    status: "upcoming",
    position: { left: 80.2, top: 44.4 },
    color: "#b98c4d",
    image:
      "linear-gradient(25deg, transparent 42%, #356458 43% 53%, transparent 54%), linear-gradient(145deg, #7d9481 0 38%, #d6a15d 39% 65%, #dfcfad 66%)",
    story:
      "The Jordaan began as a dense residential district for workers and immigrants. In the late 20th century, galleries, cafes, and small studios moved in, while its narrow streets retained their intimate scale.",
  },
  {
    id: "anne-frank",
    time: "15:15",
    title: "Anne Frank House",
    subtitle: "Understand war and memory through one hidden room",
    category: "Site of Memory",
    duration: "90 min",
    walk: "7 min walk",
    distance: "4.0 km",
    status: "upcoming",
    position: { left: 89.2, top: 21.7 },
    color: "#6f6564",
    image:
      "linear-gradient(90deg, transparent 17%, #6d4032 18% 25%, transparent 26% 53%, #6d4032 54% 61%, transparent 62%), linear-gradient(160deg, #84928d 0 42%, #98725e 43% 70%, #d2bea1 71%)",
    story:
      "Anne Frank and her family hid for two years in the secret annex behind this canal house. Through the original rooms, her diary, and personal objects, the museum gives human scale to Nazi persecution and reminds us why memory must be preserved.",
  },
];

const timeline = document.querySelector("#timeline");
const mapPins = document.querySelector("#mapPins");
const detailSheet = document.querySelector("#detailSheet");
const toast = document.querySelector("#toast");
const STORAGE_KEY = "citytrace:journey:v1";
let selectedPlaceId = "dam";
let savedPlaceIds = new Set();
let mapScale = 1;
let toastTimer;

function persistJourney() {
  const state = {
    selectedPlaceId,
    savedPlaceIds: [...savedPlaceIds],
    statuses: Object.fromEntries(places.map((place) => [place.id, place.status])),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The trip remains usable when storage is unavailable or full.
  }
}

function restoreJourney() {
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!state || typeof state !== "object") return;

    const validPlaceIds = new Set(places.map((place) => place.id));
    savedPlaceIds = new Set(
      Array.isArray(state.savedPlaceIds)
        ? state.savedPlaceIds.filter((placeId) => validPlaceIds.has(placeId))
        : [],
    );

    if (validPlaceIds.has(state.selectedPlaceId)) {
      selectedPlaceId = state.selectedPlaceId;
    }

    if (state.statuses && typeof state.statuses === "object") {
      places.forEach((place) => {
        const status = state.statuses[place.id];
        if (["done", "active", "upcoming"].includes(status)) {
          place.status = status;
        }
      });
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function updateCurrentLocation() {
  const completedPlaces = places.filter((place) => place.status === "done");
  const currentPlace = completedPlaces.at(-1) ?? places[0];
  const currentLocation = document.querySelector("#currentLocation");
  currentLocation.style.left = `${currentPlace.position.left}%`;
  currentLocation.style.top = `${currentPlace.position.top}%`;
}

function renderTimeline() {
  timeline.innerHTML = places
    .map(
      (place, index) => `
        <article class="timeline-item ${place.status}" data-place-id="${place.id}">
          <time class="timeline-time">${place.time}</time>
          <span class="timeline-node" aria-hidden="true"></span>
          <button class="place-card" aria-label="View details for ${place.title}">
            <span class="place-image" style="--image: ${place.image}"></span>
            <span class="place-copy">
              <h3>${place.title}</h3>
              <p>${place.subtitle}</p>
              <span class="place-meta">
                <span>◷ ${place.duration}</span>
                <span>↗ ${place.walk}</span>
              </span>
            </span>
            <span class="place-arrow">›</span>
          </button>
        </article>
      `,
    )
    .join("");

  timeline.querySelectorAll(".timeline-item").forEach((item) => {
    item.querySelector(".place-card").addEventListener("click", () => {
      selectPlace(item.dataset.placeId, true);
    });
  });
}

function renderMapPins() {
  mapPins.innerHTML = places
    .map(
      (place, index) => `
        <button
          class="map-pin ${place.status === "done" ? "done" : ""} ${place.id === selectedPlaceId ? "selected" : ""}"
          data-place-id="${place.id}"
          style="left:${place.position.left}%; top:${place.position.top}%"
          aria-label="${place.title}"
        >
          <span>${place.status === "done" ? "✓" : index + 1}</span>
        </button>
      `,
    )
    .join("");

  mapPins.querySelectorAll(".map-pin").forEach((pin) => {
    pin.addEventListener("click", () => selectPlace(pin.dataset.placeId, true));
  });
}

function selectPlace(placeId, openDetails = false) {
  selectedPlaceId = placeId;
  document.querySelectorAll(".timeline-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.placeId === placeId);
  });
  document.querySelectorAll(".map-pin").forEach((pin) => {
    pin.classList.toggle("selected", pin.dataset.placeId === placeId);
  });

  const timelineItem = document.querySelector(`[data-place-id="${placeId}"].timeline-item`);
  timelineItem?.scrollIntoView({ behavior: "smooth", block: "nearest" });

  if (openDetails) {
    openPlaceDetails(placeId);
  }

  persistJourney();
}

function openPlaceDetails(placeId) {
  const place = places.find((item) => item.id === placeId);
  const index = places.findIndex((item) => item.id === placeId);

  document.querySelector("#sheetVisual").style.setProperty("--image", place.image);
  document.querySelector("#sheetCategory").textContent = place.category;
  document.querySelector("#sheetNumber").textContent = String(index + 1).padStart(2, "0");
  document.querySelector("#sheetTime").textContent = `${place.time} · TODAY`;
  document.querySelector("#sheetTitle").textContent = place.title;
  document.querySelector("#sheetSubtitle").textContent = place.subtitle;
  document.querySelector("#sheetStory").textContent = place.story;
  document.querySelector("#sheetFacts").innerHTML = `
    <div class="fact"><span>Suggested time</span><strong>${place.duration}</strong></div>
    <div class="fact"><span>From last stop</span><strong>${place.walk}</strong></div>
    <div class="fact"><span>Total distance</span><strong>${place.distance}</strong></div>
  `;
  document.querySelector("#arriveButton").textContent =
    place.status === "done" ? "Place completed" : "Simulate arrival";
  document.querySelector("#arriveButton").disabled = place.status === "done";
  const isSaved = savedPlaceIds.has(place.id);
  const saveButton = document.querySelector("#saveButton");
  saveButton.classList.toggle("saved", isSaved);
  saveButton.textContent = isSaved ? "♥ Saved" : "♡ Save place";

  detailSheet.classList.add("open");
  detailSheet.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closePlaceDetails() {
  detailSheet.classList.remove("open");
  detailSheet.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function markArrived() {
  const selectedIndex = places.findIndex((place) => place.id === selectedPlaceId);
  places.forEach((place, index) => {
    if (index <= selectedIndex) place.status = "done";
    else if (index === selectedIndex + 1) place.status = "active";
    else place.status = "upcoming";
  });

  const arrivedPlace = places[selectedIndex];
  const nextPlace = places[selectedIndex + 1];

  renderTimeline();
  renderMapPins();
  updateProgress();
  updateCurrentLocation();
  closePlaceDetails();
  showToast(
    nextPlace
      ? `You arrived at ${arrivedPlace.title}. Next stop: ${nextPlace.title}.`
      : "Today's city walk is complete. Your journey has been saved.",
  );

  if (nextPlace) {
    selectPlace(nextPlace.id);
  }

  persistJourney();
}

function updateProgress() {
  const doneCount = places.filter((place) => place.status === "done").length;
  const percentage = (doneCount / places.length) * 100;
  document.querySelector("#progressNumber").textContent = `${doneCount}/${places.length}`;
  document.querySelector("#progressText").textContent =
    `${doneCount} ${doneCount === 1 ? "place" : "places"} completed`;
  document.querySelector("#progressRing").style.background =
    `conic-gradient(var(--coral) ${percentage}%, #e1e2dc 0)`;
}

function setMapScale(nextScale) {
  mapScale = Math.min(1.35, Math.max(0.85, nextScale));
  document.querySelector("#map .map-art").style.transform = `scale(${mapScale})`;
  mapPins.style.transform = `scale(${mapScale})`;
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

document.querySelector("#closeSheetButton").addEventListener("click", closePlaceDetails);
document.querySelector("#closeSheetBackdrop").addEventListener("click", closePlaceDetails);
document.querySelector("#arriveButton").addEventListener("click", markArrived);

document.querySelector("#saveButton").addEventListener("click", (event) => {
  const isSaved = !savedPlaceIds.has(selectedPlaceId);
  if (isSaved) savedPlaceIds.add(selectedPlaceId);
  else savedPlaceIds.delete(selectedPlaceId);

  event.currentTarget.classList.toggle("saved", isSaved);
  event.currentTarget.textContent = isSaved ? "♥ Saved" : "♡ Save place";
  persistJourney();
  showToast(isSaved ? "Place added to your saved list" : "Place removed from your saved list");
});

document.querySelector("#zoomInButton").addEventListener("click", () => setMapScale(mapScale + 0.1));
document.querySelector("#zoomOutButton").addEventListener("click", () => setMapScale(mapScale - 0.1));
document.querySelector("#recenterButton").addEventListener("click", () => setMapScale(1));
document.querySelector("#locationButton").addEventListener("click", () => {
  setMapScale(1.15);
  showToast("Centered on your current location");
});

document.querySelector("#notificationButton").addEventListener("click", () => {
  showToast("09:35 Dam Square: You are nearby. Open the historical story.");
  document.querySelector(".notification-dot").style.display = "none";
});

document.querySelector("#adjustButton").addEventListener("click", () => {
  showToast("Your trip is on schedule and should finish before 5:00 PM.");
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    if (button.dataset.view !== "journey") {
      showToast(`${button.textContent.trim()} will be available in the next release`);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePlaceDetails();
});

restoreJourney();
renderTimeline();
renderMapPins();
updateProgress();
updateCurrentLocation();

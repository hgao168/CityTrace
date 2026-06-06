const places = [
  {
    id: "centraal",
    time: "09:00",
    title: "阿姆斯特丹中央车站",
    subtitle: "从城市的水上大门出发",
    category: "城市地标",
    duration: "20 分钟",
    walk: "起点",
    distance: "0 km",
    status: "done",
    position: { left: 15.6, top: 72.7 },
    color: "#607f78",
    image:
      "linear-gradient(165deg, transparent 35%, #b75a3d 36% 52%, transparent 53%), linear-gradient(20deg, #668c85 0 30%, #d9b58c 31% 62%, #d9d0b6 63%)",
    story:
      "这座新文艺复兴风格车站建于 19 世纪末，像一道宏大的城市门廊。它建在三座人工岛和数千根木桩之上，也改变了阿姆斯特丹与海港之间的关系。",
  },
  {
    id: "dam",
    time: "09:35",
    title: "水坝广场",
    subtitle: "一座城市从这里开始",
    category: "历史广场",
    duration: "35 分钟",
    walk: "步行 9 分钟",
    distance: "0.7 km",
    status: "active",
    position: { left: 32.8, top: 49.6 },
    color: "#a2694d",
    image:
      "linear-gradient(90deg, transparent 18%, #cfa47d 19% 55%, transparent 56%), linear-gradient(160deg, #778a83 0 45%, #dbc5a9 46%)",
    story:
      "13 世纪，人们在阿姆斯特尔河上筑起水坝，城市的名字也由此而来。今天站在广场中央，皇宫、国家纪念碑和旧商业街仍在讲述贸易、权力与公共生活如何汇聚于此。",
  },
  {
    id: "begijnhof",
    time: "10:30",
    title: "贝居安会院",
    subtitle: "闹市里保存下来的安静庭院",
    category: "隐秘庭院",
    duration: "30 分钟",
    walk: "步行 11 分钟",
    distance: "1.5 km",
    status: "upcoming",
    position: { left: 52.4, top: 53.1 },
    color: "#7c8e6d",
    image:
      "linear-gradient(100deg, transparent 32%, #4d6659 33% 40%, transparent 41%), linear-gradient(25deg, #5d7e6d 0 35%, #c99c77 36% 67%, #d8ccad 68%)",
    story:
      "这个内院曾是贝居安修女的生活社区。她们没有正式加入修会，却以相对独立的方式生活、工作和照顾病患。院内还能看到阿姆斯特丹少数留存的中世纪木屋。",
  },
  {
    id: "canal",
    time: "11:25",
    title: "九街与运河带",
    subtitle: "沿着黄金时代的城市弧线",
    category: "世界遗产",
    duration: "60 分钟",
    walk: "步行 8 分钟",
    distance: "2.1 km",
    status: "upcoming",
    position: { left: 67.4, top: 32.3 },
    color: "#638699",
    image:
      "linear-gradient(75deg, transparent 47%, #aad0d2 48% 58%, transparent 59%), linear-gradient(155deg, #607b76 0 42%, #b36f52 43% 62%, #d5bc92 63%)",
    story:
      "17 世纪的运河扩建计划，把水利工程、住宅和商业组织成优雅的同心圆。狭窄而高耸的运河屋并非审美偶然，它们也反映了按临水立面宽度征税的城市制度。",
  },
  {
    id: "jordaan",
    time: "13:30",
    title: "约旦区午餐漫步",
    subtitle: "在工匠街区尝一口当地生活",
    category: "街区生活",
    duration: "75 分钟",
    walk: "步行 13 分钟",
    distance: "3.2 km",
    status: "upcoming",
    position: { left: 80.2, top: 44.4 },
    color: "#b98c4d",
    image:
      "linear-gradient(25deg, transparent 42%, #356458 43% 53%, transparent 54%), linear-gradient(145deg, #7d9481 0 38%, #d6a15d 39% 65%, #dfcfad 66%)",
    story:
      "约旦区最初是为工人和移民修建的密集住宅区。20 世纪后期，它逐渐转变为画廊、咖啡馆和小型工作室聚集的社区，但狭窄街巷依旧保留着原本亲密的尺度。",
  },
  {
    id: "anne-frank",
    time: "15:15",
    title: "安妮·弗兰克之家",
    subtitle: "在一间密室里理解战争与记忆",
    category: "记忆场所",
    duration: "90 分钟",
    walk: "步行 7 分钟",
    distance: "4.0 km",
    status: "upcoming",
    position: { left: 89.2, top: 21.7 },
    color: "#6f6564",
    image:
      "linear-gradient(90deg, transparent 17%, #6d4032 18% 25%, transparent 26% 53%, #6d4032 54% 61%, transparent 62%), linear-gradient(160deg, #84928d 0 42%, #98725e 43% 70%, #d2bea1 71%)",
    story:
      "安妮·弗兰克一家曾在这栋运河屋后方的密室中躲藏两年。展览通过原址、日记和个人物件，呈现一个具体家庭在纳粹迫害下的生活，也提醒我们记忆需要持续被讲述。",
  },
];

const timeline = document.querySelector("#timeline");
const mapPins = document.querySelector("#mapPins");
const detailSheet = document.querySelector("#detailSheet");
const toast = document.querySelector("#toast");
let selectedPlaceId = "dam";
let mapScale = 1;
let toastTimer;

function renderTimeline() {
  timeline.innerHTML = places
    .map(
      (place, index) => `
        <article class="timeline-item ${place.status}" data-place-id="${place.id}">
          <time class="timeline-time">${place.time}</time>
          <span class="timeline-node" aria-hidden="true"></span>
          <button class="place-card" aria-label="查看${place.title}详情">
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
    <div class="fact"><span>建议停留</span><strong>${place.duration}</strong></div>
    <div class="fact"><span>从上一站</span><strong>${place.walk}</strong></div>
    <div class="fact"><span>累计路程</span><strong>${place.distance}</strong></div>
  `;
  document.querySelector("#arriveButton").textContent =
    place.status === "done" ? "已完成此地点" : "模拟到达这里";
  document.querySelector("#arriveButton").disabled = place.status === "done";

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
  const currentLocation = document.querySelector("#currentLocation");
  currentLocation.style.left = `${arrivedPlace.position.left}%`;
  currentLocation.style.top = `${arrivedPlace.position.top}%`;

  renderTimeline();
  renderMapPins();
  updateProgress();
  closePlaceDetails();
  showToast(
    nextPlace
      ? `已到达「${arrivedPlace.title}」。下一站：${nextPlace.title}`
      : "今天的城市漫游完成了，足迹已经保存。",
  );

  if (nextPlace) {
    selectPlace(nextPlace.id);
  }
}

function updateProgress() {
  const doneCount = places.filter((place) => place.status === "done").length;
  const percentage = (doneCount / places.length) * 100;
  document.querySelector("#progressNumber").textContent = `${doneCount}/${places.length}`;
  document.querySelector("#progressText").textContent = `已完成 ${doneCount} 个地点`;
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
  const isSaved = event.currentTarget.classList.toggle("saved");
  event.currentTarget.textContent = isSaved ? "♥ 已收藏" : "♡ 收藏地点";
  showToast(isSaved ? "地点已加入收藏" : "已从收藏中移除");
});

document.querySelector("#zoomInButton").addEventListener("click", () => setMapScale(mapScale + 0.1));
document.querySelector("#zoomOutButton").addEventListener("click", () => setMapScale(mapScale - 0.1));
document.querySelector("#recenterButton").addEventListener("click", () => setMapScale(1));
document.querySelector("#locationButton").addEventListener("click", () => {
  setMapScale(1.15);
  showToast("已定位到你的当前位置");
});

document.querySelector("#notificationButton").addEventListener("click", () => {
  showToast("09:35 水坝广场：你已进入地点附近，可打开历史介绍。");
  document.querySelector(".notification-dot").style.display = "none";
});

document.querySelector("#adjustButton").addEventListener("click", () => {
  showToast("MVP 演示：行程正常，预计 17:00 前完成全部地点。");
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    if (button.dataset.view !== "journey") {
      showToast(`${button.textContent.trim()}将在下一版本开放`);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePlaceDetails();
});

renderTimeline();
renderMapPins();
updateProgress();

const STORAGE_KEY = "citytrace:journey:v1";

function loadJourneyState(places, seed, sanitizeJourneyState) {
  try {
    const stored = wx.getStorageSync(STORAGE_KEY);
    return sanitizeJourneyState(places, stored, seed);
  } catch (error) {
    return seed;
  }
}

function saveJourneyState(state) {
  try {
    wx.setStorageSync(STORAGE_KEY, state);
  } catch (error) {
    // Journey interactions remain available when storage is unavailable.
  }
}

module.exports = {
  loadJourneyState,
  saveJourneyState,
};

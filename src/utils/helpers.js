function convertLocation(long, lat) {
  return {
    type: "Point",
    coordinates: [parseFloat(long), parseFloat(lat)],
  };
}
module.exports = { convertLocation };

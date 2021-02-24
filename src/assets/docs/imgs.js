const requireComponent = require.context('./img', false, /\.png$/);

const result = {};
function validateFileName(str) {
  return /^\S+\.png$/.test(str) && str.replace(/^\S+\/(\w+)\.png$/, (rs, $1) => $1);
}
requireComponent.keys().forEach((filePath) => {
  const componentConfig = requireComponent(filePath);
  const fileName = validateFileName(filePath);
  result[fileName] = componentConfig;
});
export default result;

const requireComponent = require.context('../assets/svg', false, /\.svg$/);

const result = {};
function capitalizeFirstLetter(str) {
  return str.toUpperCase();
}
function validateFileName(str) {
  return /^\S+\.svg$/.test(str) && str.replace(/^\S+\/(\w+)\.svg$/, (rs, $1) => capitalizeFirstLetter($1));
}
requireComponent.keys().forEach(filePath => {
  const componentConfig = requireComponent(filePath);
  const fileName = validateFileName(filePath);
  result[fileName] = componentConfig;
});
export default result;
export function getIconByName(name) {
  let svgContent = result[name.toUpperCase()].default.content.replace(/symbol/g, 'svg');
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

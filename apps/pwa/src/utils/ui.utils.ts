export const classNames = (classess: { [key: string]: boolean }) => {
  return Object.keys(classess).filter(key => classess[key]).join(' ');
}
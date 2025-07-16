export const classNamesRecord = (classess: { [key: string]: boolean }) => {
  return Object.keys(classess).filter(key => classess[key]).join(' ');
}

export const classNames = (...classes: (string | Record<string, any>)[]) => {
  return classes.map(v => typeof v === 'string' ? v : classNamesRecord(v)).join(' ');
}
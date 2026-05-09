
export const cleanDocument = (data: any) => {
  let _data = { ...data };
  if (_data._id) delete _data._id;
  if (typeof _data.isArchived) delete _data.isArchived;
  return JSON.parse(JSON.stringify(_data));
}
export function setName(name){
  return{
    type : "CHANGE_NAME",
    payload : name
  }
}

export function changeName(age){
  return{
    type : "CHANGE_AGE",
    payload : age
  }
}
function get(source,string){
  const arr=string.split('.')
  if(source[arr[0]]==null||arr.length==1){
    return source[arr[0]]
  }else{
    return get(source[arr[0]],arr.slice(1).join(''))
  }
}
const obj={
  name:'lwp',
  bag:{
    name:'书包'
  }
}
console.log(get(obj,'bag.name'))
class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const vehicleToOwnerMap = new WeakMap<Vehicle, Person>;

class Vehicle {
  static get owners(): WeakMap<Vehicle, Person> {
    return vehicleToOwnerMap;
  }

  constructor(owner: Person) {
    vehicleToOwnerMap.set(this, owner);
  }
}

const Fred = new Person("Fred");
const hisCar = new Vehicle(Fred);
void(hisCar);

searchReferences("class static getters", Fred, [Vehicle], true);

class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const vehicleToOwnerMap = new WeakMap<Vehicle, Person>;

class Vehicle {
  constructor(owner: Person) {
    vehicleToOwnerMap.set(this, owner);
  }
}

function getOwner(
  this: WeakMap<Vehicle, Person>,
  vehicle: Vehicle
): Person
{
  return this.get(vehicle)!;
}

const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);

const boundGetOwner = getOwner.bind(vehicleToOwnerMap, hisBike);

searchReferences("bound function to target", Fred, [boundGetOwner], true);

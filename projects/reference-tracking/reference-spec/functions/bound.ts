class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const vehicleToOwnerMap = new Map<Vehicle, Person>;

class Vehicle {
  constructor(owner: Person) {
    vehicleToOwnerMap.set(this, owner);
  }
}

function getOwner(
  this: Map<Vehicle, Person>,
  vehicle: Vehicle
): Person
{
  return this.get(vehicle)!;
}

const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);

const boundGetOwner = getOwner.bind(vehicleToOwnerMap, hisBike);

searchReferences("bound function to target", Vehicle, [boundGetOwner], true);

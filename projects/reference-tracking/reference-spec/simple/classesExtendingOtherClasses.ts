class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Vehicle {
  owner: Person;

  constructor(owner: Person) {
    this.owner = owner;
  }
}

class Bicycle extends Vehicle {
  driver: Person;

  constructor(owner: Person, driver: Person) {
    super(owner);
    this.driver = driver;
  }
}

const Fred = new Person("Fred");
const Betty = new Person("Betty");

const hisBike = new Bicycle(Fred, Betty);
searchReferences("Bicycle extends Vehicle", Vehicle, [hisBike], true);

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

const Fred = new Person("Fred");
const hisBike = new Vehicle(Fred);

searchReferences("class without extensions", Fred, [hisBike], true);

import { searchReferences } from "./searchReferences.js";

class Person {
  readonly name: string;

  mom?: Person;
  dad?: Person;

  constructor(name: string) {
    this.name = name;
  }

  setParents(mom: Person, dad: Person): void {
    this.mom = mom;
    this.dad = dad;
  }
}

const Carl = new Person("Carl");
const Susan = new Person("Susan");
const Peter = new Person("Peter");
Carl.setParents(Susan, Peter);

const Tiffany = new Person("Tiffany");
const Frank = new Person("Frank");
Susan.setParents(Tiffany, Frank);

const Alice = new Person("Alice");
const Bob = new Person("Bob");
Peter.setParents(Alice, Bob);

report([searchReferences(Bob, [Carl], true)]);

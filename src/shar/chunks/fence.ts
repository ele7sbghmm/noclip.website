
export interface Fence {
  wall: Wall;
}
interface Wall {
  start: number[];
  end: number[];
  normal: number[];
};

// import walls from '../data/flandersHouse.json'
//
// const flanders_house: Fence = walls;
//
// export { flanders_house }
//

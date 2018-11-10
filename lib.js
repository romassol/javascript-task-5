'use strict';

function compareByName(first, second) {
    return first.name.localeCompare(second.name);
}

function getFriendByName(friends, name) {
    const friend = friends.filter(f => f.name === name);

    if (friend.length === 0) {
        return null;
    }

    return friend[0];
}

function getFriends(Arcadyfriends, maxLevel = Infinity) {
    let currentLevel = 1;
    let currentLevelFriends = Arcadyfriends.filter(friend => friend.best).sort(compareByName);

    const friends = currentLevelFriends.slice();

    while (currentLevelFriends.length !== 0 && currentLevel < maxLevel) {
        currentLevelFriends = currentLevelFriends
            .reduce((prev, curr) => [...prev, ...curr.friends], [])
            .map(friendName => getFriendByName(Arcadyfriends, friendName))
            .filter((item, pos, self) => !friends.includes(item) && self.indexOf(item) === pos)
            .sort(compareByName);
        friends.push(...currentLevelFriends);
        currentLevel++;
    }

    return friends;
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError('filter is not instance of Filter');
    }
    this.guests = getFriends(friends).filter(friend => filter.isRelevent(friend));
}

Iterator.prototype = {
    guests: [],
    currentIndex: 0,
    done() {
        return this.currentIndex >= this.guests.length;
    },
    next() {
        return this.done() ? null : this.guests[this.currentIndex++];
    }
};

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    Iterator.call(this, friends, filter);
    this.guests = getFriends(friends, maxLevel).filter(friend => filter.isRelevent(friend));
}

Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.isRelevent = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.isRelevent = friend => friend.gender === 'male';
}

Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.isRelevent = friend => friend.gender === 'female';
}

Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;

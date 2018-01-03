(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.kdIntervalTree = factory());
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var shallowequal = function shallowEqual(objA, objB, compare, compareContext) {

    var ret = compare ? compare.call(compareContext, objA, objB) : void 0;

    if(ret !== void 0) {
        return !!ret;
    }

    if(objA === objB) {
        return true;
    }

    if(typeof objA !== 'object' || !objA ||
       typeof objB !== 'object' || !objB) {
        return false;
    }

    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);

    if(keysA.length !== keysB.length) {
        return false;
    }

    var bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);

    // Test for A's keys different from B.
    for(var idx = 0; idx < keysA.length; idx++) {

        var key = keysA[idx];

        if(!bHasOwnProperty(key)) {
            return false;
        }

        var valueA = objA[key];
        var valueB = objB[key];

        ret = compare ? compare.call(compareContext, valueA, valueB, key) : void 0;

        if(ret === false ||
           ret === void 0 && valueA !== valueB) {
            return false;
        }

    }

    return true;

};

var lib = createCommonjsModule(function (module, exports) {
"use strict";
// An augmented AVL Tree where each node maintains a list of records and their search intervals.
// Record is composed of an interval and its underlying data, sent by a client. This allows the
// interval tree to have the same interval inserted multiple times, as long its data is different.
// Both insertion and deletion require O(log n) time. Searching requires O(k*logn) time, where `k`
// is the number of intervals in the output list.
Object.defineProperty(exports, "__esModule", { value: true });

function height(node) {
    if (node === undefined) {
        return -1;
    }
    else {
        return node.height;
    }
}
var Node = /** @class */ (function () {
    function Node(intervalTree, record) {
        this.intervalTree = intervalTree;
        this.records = [];
        this.height = 0;
        this.key = record.low;
        this.max = record.high;
        // Save the array of all records with the same key for this node
        this.records.push(record);
    }
    // Gets the highest record.high value for this node
    Node.prototype.getNodeHigh = function () {
        var high = this.records[0].high;
        for (var i = 1; i < this.records.length; i++) {
            if (this.records[i].high > high) {
                high = this.records[i].high;
            }
        }
        return high;
    };
    // Updates height value of the node. Called during insertion, rebalance, removal
    Node.prototype.updateHeight = function () {
        this.height = Math.max(height(this.left), height(this.right)) + 1;
    };
    // Updates the max value of all the parents after inserting into already existing node, as well as
    // removing the node completely or removing the record of an already existing node. Starts with
    // the parent of an affected node and bubbles up to root
    Node.prototype.updateMaxOfParents = function () {
        if (this === undefined) {
            return;
        }
        var thisHigh = this.getNodeHigh();
        if (this.left !== undefined && this.right !== undefined) {
            this.max = Math.max(Math.max(this.left.max, this.right.max), thisHigh);
        }
        else if (this.left !== undefined && this.right === undefined) {
            this.max = Math.max(this.left.max, thisHigh);
        }
        else if (this.left === undefined && this.right !== undefined) {
            this.max = Math.max(this.right.max, thisHigh);
        }
        else {
            this.max = thisHigh;
        }
        if (this.parent) {
            this.parent.updateMaxOfParents();
        }
    };
    /*
    Left-Left case:
  
           z                                      y
          / \                                   /   \
         y   T4      Right Rotate (z)          x     z
        / \          - - - - - - - - ->       / \   / \
       x   T3                                T1 T2 T3 T4
      / \
    T1   T2
  
    Left-Right case:
  
         z                               z                           x
        / \                             / \                        /   \
       y   T4  Left Rotate (y)         x  T4  Right Rotate(z)     y     z
      / \      - - - - - - - - ->     / \      - - - - - - - ->  / \   / \
    T1   x                           y  T3                      T1 T2 T3 T4
        / \                         / \
      T2   T3                      T1 T2
    */
    // Handles Left-Left case and Left-Right case after rebalancing AVL tree
    Node.prototype._updateMaxAfterRightRotate = function () {
        var parent = this.parent;
        var left = parent.left;
        // Update max of left sibling (x in first case, y in second)
        var thisParentLeftHigh = left.getNodeHigh();
        if (left.left === undefined && left.right !== undefined) {
            left.max = Math.max(thisParentLeftHigh, left.right.max);
        }
        else if (left.left !== undefined && left.right === undefined) {
            left.max = Math.max(thisParentLeftHigh, left.left.max);
        }
        else if (left.left === undefined && left.right === undefined) {
            left.max = thisParentLeftHigh;
        }
        else {
            left.max = Math.max(Math.max(left.left.max, left.right.max), thisParentLeftHigh);
        }
        // Update max of itself (z)
        var thisHigh = this.getNodeHigh();
        if (this.left === undefined && this.right !== undefined) {
            this.max = Math.max(thisHigh, this.right.max);
        }
        else if (this.left !== undefined && this.right === undefined) {
            this.max = Math.max(thisHigh, this.left.max);
        }
        else if (this.left === undefined && this.right === undefined) {
            this.max = thisHigh;
        }
        else {
            this.max = Math.max(Math.max(this.left.max, this.right.max), thisHigh);
        }
        // Update max of parent (y in first case, x in second)
        parent.max = Math.max(Math.max(parent.left.max, parent.right.max), parent.getNodeHigh());
    };
    /*
    Right-Right case:
  
      z                               y
     / \                            /   \
    T1  y     Left Rotate(z)       z     x
       / \   - - - - - - - ->     / \   / \
      T2  x                      T1 T2 T3 T4
         / \
        T3 T4
  
    Right-Left case:
  
       z                            z                            x
      / \                          / \                         /   \
     T1  y   Right Rotate (y)     T1  x      Left Rotate(z)   z     y
        / \  - - - - - - - - ->      / \   - - - - - - - ->  / \   / \
       x  T4                        T2  y                   T1 T2 T3 T4
      / \                              / \
    T2   T3                           T3 T4
    */
    // Handles Right-Right case and Right-Left case in rebalancing AVL tree
    Node.prototype._updateMaxAfterLeftRotate = function () {
        var parent = this.parent;
        var right = parent.right;
        // Update max of right sibling (x in first case, y in second)
        var thisParentRightHigh = right.getNodeHigh();
        if (right.left === undefined && right.right !== undefined) {
            right.max = Math.max(thisParentRightHigh, right.right.max);
        }
        else if (right.left !== undefined && right.right === undefined) {
            right.max = Math.max(thisParentRightHigh, right.left.max);
        }
        else if (right.left === undefined && right.right === undefined) {
            right.max = thisParentRightHigh;
        }
        else {
            right.max = Math.max(Math.max(right.left.max, right.right.max), thisParentRightHigh);
        }
        // Update max of itself (z)
        var thisHigh = this.getNodeHigh();
        if (this.left === undefined && this.right !== undefined) {
            this.max = Math.max(thisHigh, this.right.max);
        }
        else if (this.left !== undefined && this.right === undefined) {
            this.max = Math.max(thisHigh, this.left.max);
        }
        else if (this.left === undefined && this.right === undefined) {
            this.max = thisHigh;
        }
        else {
            this.max = Math.max(Math.max(this.left.max, this.right.max), thisHigh);
        }
        // Update max of parent (y in first case, x in second)
        parent.max = Math.max(Math.max(parent.left.max, right.max), parent.getNodeHigh());
    };
    Node.prototype._leftRotate = function () {
        var rightChild = this.right;
        rightChild.parent = this.parent;
        if (rightChild.parent === undefined) {
            this.intervalTree.root = rightChild;
        }
        else {
            if (rightChild.parent.left === this) {
                rightChild.parent.left = rightChild;
            }
            else if (rightChild.parent.right === this) {
                rightChild.parent.right = rightChild;
            }
        }
        this.right = rightChild.left;
        if (this.right !== undefined) {
            this.right.parent = this;
        }
        rightChild.left = this;
        this.parent = rightChild;
        this.updateHeight();
        rightChild.updateHeight();
    };
    Node.prototype._rightRotate = function () {
        var leftChild = this.left;
        leftChild.parent = this.parent;
        if (leftChild.parent === undefined) {
            this.intervalTree.root = leftChild;
        }
        else {
            if (leftChild.parent.left === this) {
                leftChild.parent.left = leftChild;
            }
            else if (leftChild.parent.right === this) {
                leftChild.parent.right = leftChild;
            }
        }
        this.left = leftChild.right;
        if (this.left !== undefined) {
            this.left.parent = this;
        }
        leftChild.right = this;
        this.parent = leftChild;
        this.updateHeight();
        leftChild.updateHeight();
    };
    // Rebalances the tree if the height value between two nodes of the same parent is greater than
    // two. There are 4 cases that can happen which are outlined in the graphics above
    Node.prototype._rebalance = function () {
        if (height(this.left) >= 2 + height(this.right)) {
            var left = this.left;
            if (height(left.left) >= height(left.right)) {
                // Left-Left case
                this._rightRotate();
                this._updateMaxAfterRightRotate();
            }
            else {
                // Left-Right case
                left._leftRotate();
                this._rightRotate();
                this._updateMaxAfterRightRotate();
            }
        }
        else if (height(this.right) >= 2 + height(this.left)) {
            var right = this.right;
            if (height(right.right) >= height(right.left)) {
                // Right-Right case
                this._leftRotate();
                this._updateMaxAfterLeftRotate();
            }
            else {
                // Right-Left case
                right._rightRotate();
                this._leftRotate();
                this._updateMaxAfterLeftRotate();
            }
        }
    };
    Node.prototype.insert = function (record) {
        if (record.low < this.key) {
            // Insert into left subtree
            if (this.left === undefined) {
                this.left = new Node(this.intervalTree, record);
                this.left.parent = this;
            }
            else {
                this.left.insert(record);
            }
        }
        else {
            // Insert into right subtree
            if (this.right === undefined) {
                this.right = new Node(this.intervalTree, record);
                this.right.parent = this;
            }
            else {
                this.right.insert(record);
            }
        }
        // Update the max value of this ancestor if needed
        if (this.max < record.high) {
            this.max = record.high;
        }
        // Update height of each node
        this.updateHeight();
        // Rebalance the tree to ensure all operations are executed in O(logn) time. This is especially
        // important in searching, as the tree has a high chance of degenerating without the rebalancing
        this._rebalance();
    };
    Node.prototype._getOverlappingRecords = function (currentNode, low, high) {
        if (currentNode.key <= high && low <= currentNode.getNodeHigh()) {
            // Nodes are overlapping, check if individual records in the node are overlapping
            var tempResults = [];
            for (var i = 0; i < currentNode.records.length; i++) {
                if (currentNode.records[i].high >= low) {
                    tempResults.push(currentNode.records[i]);
                }
            }
            return tempResults;
        }
        return [];
    };
    Node.prototype.search = function (low, high) {
        // Don't search nodes that don't exist
        if (this === undefined) {
            return [];
        }
        var leftSearch = [];
        var ownSearch = [];
        var rightSearch = [];
        // If interval is to the right of the rightmost point of any interval in this node and all its
        // children, there won't be any matches
        if (low > this.max) {
            return [];
        }
        // Search left children
        if (this.left !== undefined && this.left.max >= low) {
            leftSearch = this.left.search(low, high);
        }
        // Check this node
        ownSearch = this._getOverlappingRecords(this, low, high);
        // If interval is to the left of the start of this interval, then it can't be in any child to
        // the right
        if (high < this.key) {
            return leftSearch.concat(ownSearch);
        }
        // Otherwise, search right children
        if (this.right !== undefined) {
            rightSearch = this.right.search(low, high);
        }
        // Return accumulated results, if any
        return leftSearch.concat(ownSearch, rightSearch);
    };
    // Searches for a node by a `key` value
    Node.prototype.searchExisting = function (low) {
        if (this === undefined) {
            return undefined;
        }
        if (this.key === low) {
            return this;
        }
        else if (low < this.key) {
            if (this.left !== undefined) {
                return this.left.searchExisting(low);
            }
        }
        else {
            if (this.right !== undefined) {
                return this.right.searchExisting(low);
            }
        }
        return undefined;
    };
    // Returns the smallest node of the subtree
    Node.prototype._minValue = function () {
        if (this.left === undefined) {
            return this;
        }
        else {
            return this.left._minValue();
        }
    };
    Node.prototype.remove = function (node) {
        var parent = this.parent;
        if (node.key < this.key) {
            // Node to be removed is on the left side
            if (this.left !== undefined) {
                return this.left.remove(node);
            }
            else {
                return undefined;
            }
        }
        else if (node.key > this.key) {
            // Node to be removed is on the right side
            if (this.right !== undefined) {
                return this.right.remove(node);
            }
            else {
                return undefined;
            }
        }
        else {
            if (this.left !== undefined && this.right !== undefined) {
                // Node has two children
                var minValue = this.right._minValue();
                this.key = minValue.key;
                this.records = minValue.records;
                return this.right.remove(this);
            }
            else if (parent.left === this) {
                // One child or no child case on left side
                if (this.right !== undefined) {
                    parent.left = this.right;
                    this.right.parent = parent;
                }
                else {
                    parent.left = this.left;
                    if (this.left !== undefined) {
                        this.left.parent = parent;
                    }
                }
                parent.updateMaxOfParents();
                parent.updateHeight();
                parent._rebalance();
                return this;
            }
            else if (parent.right === this) {
                // One child or no child case on right side
                if (this.right !== undefined) {
                    parent.right = this.right;
                    this.right.parent = parent;
                }
                else {
                    parent.right = this.left;
                    if (this.left !== undefined) {
                        this.left.parent = parent;
                    }
                }
                parent.updateMaxOfParents();
                parent.updateHeight();
                parent._rebalance();
                return this;
            }
        }
    };
    return Node;
}());
exports.Node = Node;
var IntervalTree = /** @class */ (function () {
    function IntervalTree() {
        this.count = 0;
    }
    IntervalTree.prototype.insert = function (record) {
        if (record.low > record.high) {
            throw new Error('`low` value must be lower or equal to `high` value');
        }
        if (this.root === undefined) {
            // Base case: Tree is empty, new node becomes root
            this.root = new Node(this, record);
            this.count++;
            return true;
        }
        else {
            // Otherwise, check if node already exists with the same key
            var node = this.root.searchExisting(record.low);
            if (node !== undefined) {
                // Check the records in this node if there already is the one with same low, high, data
                for (var i = 0; i < node.records.length; i++) {
                    if (shallowequal(node.records[i], record)) {
                        // This record is same as the one we're trying to insert; return false to indicate
                        // nothing has been inserted
                        return false;
                    }
                }
                // Add the record to the node
                node.records.push(record);
                // Update max of the node and its parents if necessary
                if (record.high > node.max) {
                    node.max = record.high;
                    if (node.parent) {
                        node.parent.updateMaxOfParents();
                    }
                }
                this.count++;
                return true;
            }
            else {
                // Node with this key doesn't already exist. Call insert function on root's node
                this.root.insert(record);
                this.count++;
                return true;
            }
        }
    };
    IntervalTree.prototype.search = function (low, high) {
        if (this.root === undefined) {
            // Tree is empty; return empty array
            return [];
        }
        else {
            return this.root.search(low, high);
        }
    };
    IntervalTree.prototype.remove = function (record) {
        if (this.root === undefined) {
            // Tree is empty; nothing to remove
            return false;
        }
        else {
            var node = this.root.searchExisting(record.low);
            if (node === undefined) {
                return false;
            }
            else if (node.records.length > 1) {
                var removedRecord = void 0;
                // Node with this key has 2 or more records. Find the one we need and remove it
                for (var i = 0; i < node.records.length; i++) {
                    if (shallowequal(node.records[i], record)) {
                        removedRecord = node.records[i];
                        node.records.splice(i, 1);
                        break;
                    }
                }
                if (removedRecord) {
                    removedRecord = undefined;
                    // Update max of that node and its parents if necessary
                    if (record.high === node.max) {
                        var nodeHigh = node.getNodeHigh();
                        if (node.left !== undefined && node.right !== undefined) {
                            node.max = Math.max(Math.max(node.left.max, node.right.max), nodeHigh);
                        }
                        else if (node.left !== undefined && node.right === undefined) {
                            node.max = Math.max(node.left.max, nodeHigh);
                        }
                        else if (node.left === undefined && node.right !== undefined) {
                            node.max = Math.max(node.right.max, nodeHigh);
                        }
                        else {
                            node.max = nodeHigh;
                        }
                        if (node.parent) {
                            node.parent.updateMaxOfParents();
                        }
                    }
                    this.count--;
                    return true;
                }
                else {
                    return false;
                }
            }
            else if (node.records.length === 1) {
                // Node with this key has only 1 record. Check if the remaining record in this node is
                // actually the one we want to remove
                if (shallowequal(node.records[0], record)) {
                    // The remaining record is the one we want to remove. Remove the whole node from the tree
                    if (this.root.key === node.key) {
                        // We're removing the root element. Create a dummy node that will temporarily take
                        // root's parent role
                        var rootParent = new Node(this, { low: record.low, high: record.low });
                        rootParent.left = this.root;
                        this.root.parent = rootParent;
                        var removedNode = this.root.remove(node);
                        this.root = rootParent.left;
                        if (this.root !== undefined) {
                            this.root.parent = undefined;
                        }
                        if (removedNode) {
                            removedNode = undefined;
                            this.count--;
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        var removedNode = this.root.remove(node);
                        if (removedNode) {
                            removedNode = undefined;
                            this.count--;
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                }
                else {
                    // The remaining record is not the one we want to remove
                    return false;
                }
            }
            else {
                // No records at all in this node?! Shouldn't happen
                return false;
            }
        }
    };
    IntervalTree.prototype.inOrder = function () {
        return new InOrder(this.root);
    };
    IntervalTree.prototype.preOrder = function () {
        return new PreOrder(this.root);
    };
    return IntervalTree;
}());
exports.IntervalTree = IntervalTree;
var DataIntervalTree = /** @class */ (function () {
    function DataIntervalTree() {
        this.tree = new IntervalTree();
    }
    DataIntervalTree.prototype.insert = function (low, high, data) {
        return this.tree.insert({ low: low, high: high, data: data });
    };
    DataIntervalTree.prototype.remove = function (low, high, data) {
        return this.tree.remove({ low: low, high: high, data: data });
    };
    DataIntervalTree.prototype.search = function (low, high) {
        return this.tree.search(low, high).map(function (v) { return v.data; });
    };
    DataIntervalTree.prototype.inOrder = function () {
        return this.tree.inOrder();
    };
    DataIntervalTree.prototype.preOrder = function () {
        return this.tree.preOrder();
    };
    Object.defineProperty(DataIntervalTree.prototype, "count", {
        get: function () {
            return this.tree.count;
        },
        enumerable: true,
        configurable: true
    });
    return DataIntervalTree;
}());
exports.default = DataIntervalTree;
var InOrder = /** @class */ (function () {
    function InOrder(startNode) {
        this.stack = [];
        if (startNode !== undefined) {
            this.push(startNode);
        }
    }
    InOrder.prototype.next = function () {
        // Will only happen if stack is empty and pop is called
        if (this.currentNode === undefined) {
            return {
                done: true,
                value: undefined,
            };
        }
        // Process this node
        if (this.i < this.currentNode.records.length) {
            return {
                done: false,
                value: this.currentNode.records[this.i++],
            };
        }
        if (this.currentNode.right !== undefined) {
            this.push(this.currentNode.right);
        }
        else {
            // Might pop the last and set this.currentNode = undefined
            this.pop();
        }
        return this.next();
    };
    InOrder.prototype.push = function (node) {
        this.currentNode = node;
        this.i = 0;
        while (this.currentNode.left !== undefined) {
            this.stack.push(this.currentNode);
            this.currentNode = this.currentNode.left;
        }
    };
    InOrder.prototype.pop = function () {
        this.currentNode = this.stack.pop();
        this.i = 0;
    };
    return InOrder;
}());
exports.InOrder = InOrder;
if (typeof Symbol === 'function') {
    InOrder.prototype[Symbol.iterator] = function () { return this; };
}
var PreOrder = /** @class */ (function () {
    function PreOrder(startNode) {
        this.stack = [];
        this.i = 0;
        this.currentNode = startNode;
    }
    PreOrder.prototype.next = function () {
        // Will only happen if stack is empty and pop is called,
        // which only happens if there is no right node (i.e we are done)
        if (this.currentNode === undefined) {
            return {
                done: true,
                value: undefined,
            };
        }
        // Process this node
        if (this.i < this.currentNode.records.length) {
            return {
                done: false,
                value: this.currentNode.records[this.i++],
            };
        }
        if (this.currentNode.right !== undefined) {
            this.push(this.currentNode.right);
        }
        if (this.currentNode.left !== undefined) {
            this.push(this.currentNode.left);
        }
        this.pop();
        return this.next();
    };
    PreOrder.prototype.push = function (node) {
        this.stack.push(node);
    };
    PreOrder.prototype.pop = function () {
        this.currentNode = this.stack.pop();
        this.i = 0;
    };
    return PreOrder;
}());
exports.PreOrder = PreOrder;
if (typeof Symbol === 'function') {
    PreOrder.prototype[Symbol.iterator] = function () { return this; };
}

});

var IntervalTree = unwrapExports(lib);

var getPairs = (array => array.reduce((reducer, element, index, array) => {
  const isEven = index % 2 === 0;

  if (isEven) {
    const next = array[index + 1];
    const pair = next ? [element, next] : [element];
    return [...reducer, pair];
  }

  return reducer;
}, []));

/**
 * Once the initial params are applied, use in Array.map to populate an interval tree, returning true or an Error if the operation was not successful.
 *
 * @param {IntervalTree} tree - IntervalTree from 'node-interval-tree'
 * @param {string} lowKey - Low interval key name
 * @param {string} highKey - High interval key name
 * @returns {function(item): true|Error} true or an Error if the item was not added to the tree
 */
const addToTree = (tree, lowKey, highKey) => item => {
  const [low, high] = [item[lowKey], item[highKey]].sort();
  const inserted = tree.insert(low, high, item);
  return inserted || new Error(`${item} was not inserted into ${lowKey}, ${highKey} tree.`);
};

/**
 * Apply array of IntervalTrees first. Use in Array.map with an array of low-high value pairs which represent intervals.
 *
 * @param {IntervalTree[]} trees - an array of Interval Trees corresponding to the array of intervals
 * @returns {function(Number[], number): array}
 */
const search = trees => (interval, i) => {
  // console.log('search')
  const [low, high] = interval.sort();
  const result = trees[i].search(low, high);
  return result;
};

/**
 * Perform set operations on the search results from multiple interval trees.
 *
 * @function searchTrees
 * @param {IntervalTree[]}   trees   Each IntervalTree should contain the same set of objects mapped with different keys.
 * @param {function(array, array): array}   operator   Any lodash set operator (intersection, without, ect...), or similar function.
 * @param {number[]}    ranges   Pairs of numbers correlating to the trees param. Each pair represents an interval to search within.
 * @returns
 */
const searchTrees = trees => (operator, ranges) => {
  const curry = operator => ranges => {
    const pairs = getPairs(ranges);
    const results = pairs.map(search(trees));

    const operationResult = operator(...results);
    return operationResult;
  };

  return ranges ? curry(operator)(ranges) : curry(operator);
};

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = _freeGlobal || freeSelf || Function('return this')();

var _root = root;

/** Built-in value references. */
var Symbol$1 = _root.Symbol;

var _Symbol = Symbol$1;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

var _getRawTag = getRawTag;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

var _objectToString = objectToString;

/** `Object#toString` result references. */
var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? _getRawTag(value)
    : _objectToString(value);
}

var _baseGetTag = baseGetTag;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike;

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

var _overArg = overArg;

/** Built-in value references. */
var getPrototype = _overArg(Object.getPrototypeOf, Object);

var _getPrototype = getPrototype;

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype;
var objectProto$2 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike_1(value) || _baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = _getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$1.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

var isPlainObject_1 = isPlainObject;

/** `Object#toString` result references. */
var domExcTag = '[object DOMException]';
var errorTag = '[object Error]';

/**
 * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
 * `SyntaxError`, `TypeError`, or `URIError` object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
 * @example
 *
 * _.isError(new Error);
 * // => true
 *
 * _.isError(Error);
 * // => false
 */
function isError(value) {
  if (!isObjectLike_1(value)) {
    return false;
  }
  var tag = _baseGetTag(value);
  return tag == errorTag || tag == domExcTag ||
    (typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject_1(value));
}

var isError_1 = isError;

const logError = x => {
  const isError = isError_1(x);
  if (isError) {
    console.error(x);
  }
  return !isError;
};

/**
 * Create multiple interval trees. Can be partially applied for multiple sets of items.
 *
 * @param {String[]} keys - Array of alternating "low" and "high" property names
 * @param {Object[]} items - Array of objects with properties listed in keys argument
 * @returns {searchTrees}
 */
const createTrees = (keys, items) => {
  const curry = keys => items => {
    // console.log('createTrees')
    if (keys.length % 2 !== 0) {
      throw new Error(`Expected keys.length to be an even number. keys.length: ${keys.length}`);
    }

    const pairs = getPairs(keys);
    const trees = pairs.map((pair, i) => {
      const tree = new IntervalTree();
      items.map(addToTree(tree, ...pair)).forEach(logError);
      return tree;
    });

    const partial = searchTrees(trees, items);
    partial.count = trees.length;
    partial.trees = trees;

    return partial;
  };

  return items ? curry(keys)(items) : curry(keys);
};

return createTrees;

})));

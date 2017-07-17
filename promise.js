function Promise(cb) {
    if(typeof cb == 'function') {
        cb.call(null, this.resolve.bind(this), this.reject.bind(this));
    }
    this.init();
}

Promise.prototype = {
    PromiseStatus: 'pending',
    value: void 0,
    callStack: [],

    init() {
    	this.callStack = _.cloneDeep([]);
    	this.rejectStack = _.cloneDeep([]);
    },

    setPromise(key, value) {
        this[key] = value;
    },

    getPromise(key) {
        return this[key];
    },

    resolve(value) {
        this.setPromise('PromiseStatus', 'done');
        this.setPromise('value', value);
        this.then();
    },

    reject(err) {
    	this.setPromise('PromiseStatus', 'reject');
    	this.setPromise('value', err);
    	this.catch();
    },

    then(cb) {
        let status = this.getPromise('PromiseStatus');
        if(status == 'pending') {
        	cb.type = 1;
        	this.callStack.push(cb);
        }
        if(status == 'done') {
        	let value = this.getPromise('value'),
                length = this.callStack.length,
        	    cb,
    		    ret;

            while(length > 0) {
                cb = this.callStack.shift();
                if(cb.type == 1) {
                    ret = cb && cb(value);
                    break;
                }
                length --;
            }

    		if(!ret || ret.PromiseStatus == 'done') {
    			let currentCb,
    				currentStatus = '',
    				_p;
    			while(currentStatus != 'pending') {
    				if(!this.callStack.length) {
    					break;
    				}
					currentCb = this.callStack.shift();
					if(currentCb.type !== 1) {
						continue;
					}
					_p = currentCb && currentCb();
					currentStatus = _p && _p.PromiseStatus;
					_p.callStack = _p.callStack.concat(this.callStack);
    			}
    		}
    		else if(ret && ret.PromiseStatus == 'pending') {
    			ret.callStack = ret.callStack.concat(this.callStack);
    		}
    		else if(ret && ret.PromiseStatus == 'reject') {

    		}
        }
        return this;
    },

    catch(cb) {
    	let status = this.getPromise('PromiseStatus');
        if(status == 'pending') {
        	cb.type = 2;
        	this.callStack.push(cb);
        }
        if(status == 'reject') {
    		let value = this.getPromise('value'),
                length = this.callStack.length,
                cb = null,
                ret;
            while(length > 0) {
                cb = this.callStack.shift();
                if(cb.type == 2) {
                    ret = cb && cb(value);
                    break;
                }
                length --;
            }
            let retPromiseStatus = ret && ret.PromiseStatus;
            if(retPromiseStatus == 'reject') {
                let currentCb,
                    currentStatus = '',
                    _p;
                while(currentStatus != 'pending') {
                    if(!this.callStack.length) {
                        break;
                    }
                    currentCb = this.callStack.shift();
                    _p = currentCb && currentCb();
                    currentStatus = _p && _p.PromiseStatus;
                    _p.callStack = _p.callStack.concat(this.callStack);
                }
            }
            else if(retPromiseStatus == 'pending') {
                ret.callStack = ret.callStack.concat(this.callStack);
            }
            // else if(retPromiseStatus == 'done') {

            // }
        }
        return this;
    }
};

(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/HousieChart.svelte generated by Svelte v3.20.1 */

    const { console: console_1 } = globals;
    const file = "src/HousieChart.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			attr_dev(div, "id", "housie-chart");
    			add_location(div, file, 38, 2, 948);
    			attr_dev(main, "id", "housieContainer");
    			attr_dev(main, "class", "goLeft");
    			add_location(main, file, 37, 0, 903);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { num } = $$props, { time } = $$props;

    	afterUpdate(() => {
    		housieChart(num, time);
    	});

    	function housieChart(data, time) {
    		let x = 1;
    		let housieChart = document.getElementById("housie-chart");

    		for (x; x < 91; x++) {
    			let span = document.createElement("span");
    			span.classList.add("housie-chart-class");
    			span.innerText = x;
    			housieChart.appendChild(span);
    		}

    		gaming(data, time);
    	}

    	let data = [];

    	function gaming(data1, index) {
    		data.push(data1);
    		console.log(data);

    		if (index >= 90) {
    			return clearTimeout();
    		}

    		if (index > document.getElementsByClassName("addedToList").length) {
    			console.log("hey");

    			for (let j = 0; j < data.length; j++) {
    				document.getElementsByClassName("housie-chart-class")[data[j] - 1].classList.add("addedToList");
    			}
    		}
    	}

    	const writable_props = ["num", "time"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<HousieChart> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("HousieChart", $$slots, []);

    	$$self.$set = $$props => {
    		if ("num" in $$props) $$invalidate(0, num = $$props.num);
    		if ("time" in $$props) $$invalidate(1, time = $$props.time);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		num,
    		time,
    		housieChart,
    		data,
    		gaming
    	});

    	$$self.$inject_state = $$props => {
    		if ("num" in $$props) $$invalidate(0, num = $$props.num);
    		if ("time" in $$props) $$invalidate(1, time = $$props.time);
    		if ("data" in $$props) data = $$props.data;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [num, time];
    }

    class HousieChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { num: 0, time: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HousieChart",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*num*/ ctx[0] === undefined && !("num" in props)) {
    			console_1.warn("<HousieChart> was created without expected prop 'num'");
    		}

    		if (/*time*/ ctx[1] === undefined && !("time" in props)) {
    			console_1.warn("<HousieChart> was created without expected prop 'time'");
    		}
    	}

    	get num() {
    		throw new Error("<HousieChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set num(value) {
    		throw new Error("<HousieChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get time() {
    		throw new Error("<HousieChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set time(value) {
    		throw new Error("<HousieChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/HousieTicket.svelte generated by Svelte v3.20.1 */

    const file$1 = "src/HousieTicket.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let t0;
    	let div;
    	let button0;
    	let t2;
    	let button1;
    	let t4;
    	let button2;
    	let t6;
    	let button3;
    	let t8;
    	let button4;
    	let t10;
    	let button5;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			t0 = space();
    			div = element("div");
    			button0 = element("button");
    			button0.textContent = "Fast Five";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "Four Corners";
    			t4 = space();
    			button2 = element("button");
    			button2.textContent = "Top Line";
    			t6 = space();
    			button3 = element("button");
    			button3.textContent = "Middle Line";
    			t8 = space();
    			button4 = element("button");
    			button4.textContent = "Bottom Line";
    			t10 = space();
    			button5 = element("button");
    			button5.textContent = "Full Housie";
    			attr_dev(main, "id", "housieTicket");
    			add_location(main, file$1, 247, 0, 7693);
    			add_location(button0, file$1, 249, 2, 7766);
    			add_location(button1, file$1, 250, 2, 7827);
    			add_location(button2, file$1, 251, 2, 7891);
    			add_location(button3, file$1, 252, 2, 7951);
    			add_location(button4, file$1, 253, 2, 8014);
    			add_location(button5, file$1, 254, 2, 8077);
    			attr_dev(div, "id", "rewards");
    			add_location(div, file$1, 248, 0, 7745);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, main, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(div, t2);
    			append_dev(div, button1);
    			append_dev(div, t4);
    			append_dev(div, button2);
    			append_dev(div, t6);
    			append_dev(div, button3);
    			append_dev(div, t8);
    			append_dev(div, button4);
    			append_dev(div, t10);
    			append_dev(div, button5);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(main, "load", createTicket(), false, false, false),
    				listen_dev(button0, "click", /*click_handler*/ ctx[0], false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[1], false, false, false),
    				listen_dev(button2, "click", /*click_handler_2*/ ctx[2], false, false, false),
    				listen_dev(button3, "click", /*click_handler_3*/ ctx[3], false, false, false),
    				listen_dev(button4, "click", /*click_handler_4*/ ctx[4], false, false, false),
    				listen_dev(button5, "click", /*click_handler_5*/ ctx[5], false, false, false)
    			];
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function createTicket() {
    	document.getElementsByClassName("housie-ticket-class");

    	for (let a = 0; 27 > a; a++) {
    		let a = document.getElementById("housieTicket"),
    			b = document.createElement("span");

    		b.classList.add("notThis");

    		b.addEventListener("click", e => {
    			if (e.target.innerText != "") {
    				e.target.classList.toggle("selectedThis");
    				e.target.classList.toggle("notThis");
    			}
    		});
    	}

    	document.getElementsByClassName("housie-ticket-class");

    	for (let a = 0; 27 > a; a++) {
    		let a = document.getElementById("housieTicket"),
    			b = document.createElement("span");

    		b.classList.add("notThis");

    		b.addEventListener("click", e => {
    			if (e.target.innerText != "") {
    				e.target.classList.toggle("selectedThis");
    				e.target.classList.toggle("notThis");
    			}
    		});

    		(b.classList.add("housie-ticket-class"), b.innerText = "", a.appendChild(b));
    	}

    	if (window.localStorage["arr1"] !== undefined) {
    		let arr = JSON.parse(window.localStorage["arr"]);
    		let arr1 = JSON.parse(window.localStorage["arr1"]);
    		let a = document.getElementsByClassName("housie-ticket-class");

    		for (let ad = 0; ad < arr.length; ad++) {
    			a[arr[ad]].innerHTML = arr1[ad];
    		}
    	}

    	priority();
    }

    function randomNoRepeatv2(min, max, arr, k) {
    	let num = min[k] + Math.floor(Math.random() * (max[k] - min[k]));

    	if (arr.includes(num)) {
    		return randomNoRepeatv2(min, max, arr, k);
    	}

    	return num;
    }

    function randomNoRepeat(counted, arr, k) {
    	let num = counted[k] + Math.floor(Math.random() * (counted[k + 1] - counted[k]));

    	if (arr.includes(num)) {
    		return randomNoRepeat(counted, arr, k);
    	}

    	return num;
    }

    function priority() {
    	let a = document.getElementsByClassName("housie-ticket-class"),
    		min = [1, 10, 20, 30, 40, 50, 60, 70, 80],
    		max = [9, 19, 29, 39, 49, 59, 69, 79, 89],
    		arr = [],
    		counted = [0, 9, 18, 27],
    		arr1 = [];

    	if (window.localStorage["arr"] == undefined || window.localStorage["arr"] == "[]") {
    		for (let k = 0; k < 3; k++) {
    			for (let j = 0; j < 5; j++) {
    				arr.push(randomNoRepeat(counted, arr, k));
    			}
    		}

    		for (let ad = 0; ad < arr.length; ad++) {
    			for (let ak = 0; ak < 9; ak++) {
    				if (arr[ad] % 9 == ak) {
    					arr1.push(randomNoRepeatv2(min, max, arr1, ak));
    					a[arr[ad]].innerHTML = arr1[arr1.length - 1];
    				}
    			}
    		}
    	}

    	let f = [0, 9, 18];

    	for (let asd = 0; asd < 1; asd++) {
    		for (let kl = 0; kl < 9; kl++) {
    			{
    				if (a[f[asd] + kl].innerHTML !== "" && a[f[asd + 1] + kl].innerHTML !== "") {
    					if (a[f[asd] + kl].innerHTML > a[f[asd + 1] + kl].innerHTML) {
    						let temp = a[f[asd] + kl].innerHTML;
    						a[f[asd] + kl].innerHTML = a[f[asd + 1] + kl].innerHTML;
    						a[f[asd + 1] + kl].innerHTML = temp;
    					}
    				}

    				if (a[f[asd] + kl].innerHTML !== "" && a[f[asd + 2] + kl].innerHTML !== "") {
    					if (a[f[asd] + kl].innerHTML > a[f[asd + 2] + kl].innerHTML) {
    						let temp = a[f[asd] + kl].innerHTML;
    						a[f[asd] + kl].innerHTML = a[f[asd + 2] + kl].innerHTML;
    						a[f[asd + 2] + kl].innerHTML = temp;
    					}
    				}
    			}

    			if (a[f[asd + 1] + kl].innerHTML !== "" && a[f[asd + 2] + kl].innerHTML !== "") {
    				if (a[f[asd + 1] + kl].innerHTML > a[f[asd + 2] + kl].innerHTML) {
    					let temp = a[f[asd + 1] + kl].innerHTML;
    					a[f[asd + 1] + kl].innerHTML = a[f[asd + 2] + kl].innerHTML;
    					a[f[asd + 2] + kl].innerHTML = temp;
    				}
    			}
    		}
    	}

    	let i = 0;

    	for (let asdf = 0; asdf < 27; asdf++) {
    		if (a[asdf].innerText !== "") {
    			// console.log(i);
    			arr[i] = asdf;

    			arr1[i] = parseInt(a[asdf].innerText);
    			i++;
    		}
    	}

    	localStorage.setItem("arr", JSON.stringify(arr));
    	localStorage.setItem("arr1", JSON.stringify(arr1));
    }

    function checkHousie(num) {
    	let arr = [];
    	let arr2 = [];
    	let a = document.getElementsByClassName("selectedThis");
    	let b = document.getElementsByClassName("addedToList");
    	let button = document.getElementsByTagName("button");

    	for (let ax = 0; ax < b.length; ax++) {
    		arr.push(parseInt(b[ax].innerHTML));
    	}

    	for (let ax = 0; ax < a.length; ax++) {
    		arr2.push(parseInt(a[ax].innerHTML));
    	}

    	let arr1 = JSON.parse(window.localStorage["arr1"]);
    	let arrx = JSON.parse(window.localStorage["arr"]);

    	if (num === 0) {
    		if (!rewards[0].flag) {
    			if (arr2.length >= 5) {
    				let counter = 0;

    				arr2.forEach(a => {
    					if (arr.includes(a)) {
    						counter++;
    					}
    				});

    				if (counter >= 5) {
    					rewards["fastfive"] = 1;
    					button[num].disabled = true;
    				}
    			}
    		}
    	} else if (num === 1) {
    		if (!rewards[1].flag) {
    			let counter = 0;
    			let four = [0, 4, 10, 14];

    			for (let ij = 0; ij < arr2.length; ij++) {
    				if (arr.includes(arr2[ij]) && four.includes(arr1.indexOf(arr2[ij]))) {
    					counter++;
    				}

    				if (counter === 4) {
    					rewards["fourcorners"] = 1;
    					button[num].disabled = true;
    				}
    			}
    		}
    	} else if (num === 2) {
    		if (!rewards[2].flag) {
    			let counter = 0;
    			let four = [0, 1, 2, 3, 4];

    			for (let ij = 0; ij < arr2.length; ij++) {
    				if (arr.includes(arr2[ij]) && four.includes(arr1.indexOf(arr2[ij]))) {
    					counter++;
    				}

    				if (counter === 4) {
    					rewards["topline"] = 1;
    					button[num].disabled = true;
    				}
    			}
    		}
    	} else if (num === 3) {
    		if (!rewards[3].flag) {
    			let counter = 0;
    			let four = [5, 6, 7, 8, 9];

    			for (let ij = 0; ij < arr2.length; ij++) {
    				if (arr.includes(arr2[ij]) && four.includes(arr1.indexOf(arr2[ij]))) {
    					counter++;
    				}

    				if (counter === 4) {
    					rewards["middleline"] = 1;
    					button[num].disabled = true;
    				}
    			}
    		}
    	} else if (num === 4) {
    		if (!rewards[4].flag) {
    			let counter = 0;
    			let four = [10, 11, 12, 13, 14];

    			for (let ij = 0; ij < arr2.length; ij++) {
    				if (arr.includes(arr2[ij]) && four.includes(arr1.indexOf(arr2[ij]))) {
    					counter++;
    				}

    				if (counter === 4) {
    					rewards["bottomline"] = 1;
    					button[num].disabled = true;
    				}
    			}
    		}
    	} else if (num === 5) {
    		if (!rewards[5].flag) {
    			let counter = 0;
    			let four = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

    			for (let ij = 0; ij < arr2.length; ij++) {
    				if (arr.includes(arr2[ij]) && four.includes(arr1.indexOf(arr2[ij]))) {
    					counter++;
    				}

    				if (counter === 15) {
    					rewards["fullhousie"] = 1;
    					button[num].disabled = true;
    				}
    			}
    		}
    	}
    }

    function noRepeatfunc(a, b, c, d) {
    	for (; !a.includes(b); ) return (a.push(b), c[d].innerText = b, a);
    	(b = 10 * (d % 9) + 1 + Math.floor(Math.random() * (10 * (d % 9) + 10 - 10 * (d % 9))), noRepeatfunc(a, b, c, d));
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<HousieTicket> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("HousieTicket", $$slots, []);
    	const click_handler = () => checkHousie(0);
    	const click_handler_1 = () => checkHousie(1);
    	const click_handler_2 = () => checkHousie(2);
    	const click_handler_3 = () => checkHousie(3);
    	const click_handler_4 = () => checkHousie(4);
    	const click_handler_5 = () => checkHousie(5);

    	$$self.$capture_state = () => ({
    		createTicket,
    		randomNoRepeatv2,
    		randomNoRepeat,
    		priority,
    		checkHousie,
    		noRepeatfunc
    	});

    	return [
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5
    	];
    }

    class HousieTicket extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HousieTicket",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.20.1 */

    const { console: console_1$1 } = globals;
    const file$2 = "src/App.svelte";

    // (77:0) {#if time !== null && num !== null}
    function create_if_block(ctx) {
    	let current;

    	const housiechart = new HousieChart({
    			props: {
    				num: /*num*/ ctx[1],
    				time: /*time*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(housiechart.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(housiechart, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const housiechart_changes = {};
    			if (dirty & /*num*/ 2) housiechart_changes.num = /*num*/ ctx[1];
    			if (dirty & /*time*/ 1) housiechart_changes.time = /*time*/ ctx[0];
    			housiechart.$set(housiechart_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(housiechart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(housiechart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(housiechart, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(77:0) {#if time !== null && num !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let nav;
    	let ul;
    	let li0;
    	let div0;
    	let t1;
    	let li1;
    	let div1;
    	let t3;
    	let div3;
    	let div2;
    	let t4;
    	let div5;
    	let div4;
    	let t8;
    	let t9;
    	let if_block_anchor;
    	let current;
    	let dispose;
    	const housieticket = new HousieTicket({ $$inline: true });
    	let if_block = /*time*/ ctx[0] !== null && /*num*/ ctx[1] !== null && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			div0 = element("div");
    			div0.textContent = "Chart";
    			t1 = space();
    			li1 = element("li");
    			div1 = element("div");
    			div1.textContent = "Logout";
    			t3 = space();
    			div3 = element("div");
    			div2 = element("div");
    			t4 = space();
    			div5 = element("div");
    			div4 = element("div");

    			div4.textContent = `
      Room ID :${/*data*/ ctx[2]}, Tell Your Friends To Join Using This ID.
    `;

    			t8 = space();
    			create_component(housieticket.$$.fragment);
    			t9 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div0, "id", "bringItLeft");
    			add_location(div0, file$2, 59, 8, 1806);
    			add_location(li0, file$2, 58, 6, 1775);
    			add_location(div1, file$2, 62, 8, 1889);
    			add_location(li1, file$2, 61, 6, 1858);
    			add_location(ul, file$2, 57, 4, 1764);
    			add_location(nav, file$2, 56, 2, 1754);
    			attr_dev(div2, "id", "users");
    			add_location(div2, file$2, 67, 4, 1963);
    			attr_dev(div3, "id", "counter");
    			add_location(div3, file$2, 66, 2, 1940);
    			attr_dev(div4, "id", "info");
    			add_location(div4, file$2, 70, 4, 2032);
    			attr_dev(div5, "id", "housie-number-container");
    			add_location(div5, file$2, 69, 2, 1993);
    			add_location(main, file$2, 55, 0, 1745);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, main, anchor);
    			append_dev(main, nav);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, div0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, div1);
    			append_dev(main, t3);
    			append_dev(main, div3);
    			append_dev(div3, div2);
    			append_dev(main, t4);
    			append_dev(main, div5);
    			append_dev(div5, div4);
    			append_dev(main, t8);
    			mount_component(housieticket, main, null);
    			insert_dev(target, t9, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(li0, "click", goLeft, false, false, false),
    				listen_dev(li1, "click", logOut, false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*time*/ ctx[0] !== null && /*num*/ ctx[1] !== null) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(housieticket.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(housieticket.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(housieticket);
    			if (detaching) detach_dev(t9);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function logOut() {
    	localStorage.removeItem("arr");
    	localStorage.removeItem("arr1");
    	document.cookie = document.cookie.match("data=") + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    	location.replace("index.html");
    }

    function goLeft() {
    	document.getElementById("housieContainer").classList.toggle("goLeft");
    	document.getElementsByTagName("main")[0].classList.toggle("makeItSmall");
    }

    function gaming(num1, i) {
    	let span = document.createElement("span");
    	span.classList.add("housie-number");

    	if (document.getElementsByClassName("housie-number").length === 1) {
    		document.getElementsByClassName("housie-number")[0].remove();
    	}

    	let housieNumberVar = document.getElementById("housie-number-container");
    	span.innerText = num1;
    	housieNumberVar.appendChild(span);

    	if (i > 91) {
    		housieNumberVar.innerText = "Adios, Refreshing in 15 seconds";
    		localStorage.removeItem("arr");
    		localStorage.removeItem("arr1");

    		setTimeout(
    			() => {
    				location.replace("./index.html");
    			},
    			10000
    		);
    	}
    }

    function instance$2($$self, $$props, $$invalidate) {
    	var socket = io.connect("http://localhost:5000");
    	let xasd = 0;
    	let data = document.cookie.match("data=")["input"].slice(5);
    	socket.emit("reachedHousie", data);

    	socket.on("num", data => {
    		if (xasd !== 1) {
    			xasd = 1;
    			document.getElementById("info").style.display = "none";
    		}

    		$$invalidate(1, num = data.num);
    		$$invalidate(0, time = data.time);
    		console.log(num, time);
    		gaming(data.num, data.time);
    	});

    	let time = null;
    	let num = null;
    	let numx = [];
    	let counter = 0;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		HousieChart,
    		HousieTicket,
    		onMount,
    		socket,
    		xasd,
    		data,
    		time,
    		num,
    		logOut,
    		goLeft,
    		numx,
    		counter,
    		gaming
    	});

    	$$self.$inject_state = $$props => {
    		if ("socket" in $$props) socket = $$props.socket;
    		if ("xasd" in $$props) xasd = $$props.xasd;
    		if ("data" in $$props) $$invalidate(2, data = $$props.data);
    		if ("time" in $$props) $$invalidate(0, time = $$props.time);
    		if ("num" in $$props) $$invalidate(1, num = $$props.num);
    		if ("numx" in $$props) numx = $$props.numx;
    		if ("counter" in $$props) counter = $$props.counter;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [time, num, data];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
    	target: document.getElementById("overflowInvisible"),
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

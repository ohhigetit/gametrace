/**
 * GameTrace Reusable Form V1 — presentation only.
 * Approved visual contract: transparent form parent, individual rounded section cards,
 * responsive full/half fields, two equal bottom actions (Cancel left, Save right).
 * Does not save data, validate domain values, synchronize records, or navigate.
 * Pass existing form/control/button nodes to preserve native event listeners.
 */
(function (global) {
  'use strict';
  const doc = global.document;
  if (!doc) return;
  let serial = 0;
  const node = value => value && typeof value.nodeType === 'number';
  const make = (tag, className, value) => {
    const el = doc.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined && value !== null) el.textContent = String(value);
    return el;
  };
  const asNodes = (value, name) => {
    if (value === undefined || value === null) return [];
    const list = Array.isArray(value) ? value : [value];
    if (!list.every(node)) throw new TypeError(name + ' must contain DOM nodes');
    return list;
  };
  const put = (target, values) => asNodes(values, 'Content').forEach(child => target.appendChild(child));

  /** Form Parent V1: layout shell; accepts a native form to keep its event handlers. */
  function FormParentV1({form,sections=[],actions=null,error=null,ariaLabel='Form'}={}) {
    const root = form || make('form');
    if (root.tagName !== 'FORM') throw new TypeError('FormParentV1 needs a form element');
    const content = asNodes(sections, 'sections');
    const actionNodes = asNodes(actions, 'actions');
    const errorNodes = asNodes(error, 'error');
    root.classList.add('gtf-form-v1');
    root.dataset.component = 'FormParentV1';
    root.dataset.version = 'V1';
    root.setAttribute('aria-label',String(ariaLabel));
    const stack = make('div','gtf-stack-v1');
    stack.dataset.component = 'FormSections';
    put(stack,content);
    // This is an explicit composition operation. Any legacy controls that must
    // remain live should be included in sections, not silently duplicated.
    root.replaceChildren(...errorNodes,stack,...actionNodes);
    return root;
  }

  /** Form Section V1: independently rounded card with optional title and subtitle. */
  function FormSectionV1({title='',subtitle='',content=[],columns=1,ariaLabel=''}={}) {
    if (columns !== 1 && columns !== 2) throw new TypeError('columns must be 1 or 2');
    const section = make('section','gtf-section-v1');
    section.dataset.component = 'FormSectionV1';
    if (title || subtitle) {
      const head = make('div','gtf-section-head-v1');
      if (title) {
        const h = make('h2','gtf-section-title-v1',title);
        h.id = 'gtf-section-'+(++serial);
        section.setAttribute('aria-labelledby',h.id);
        head.appendChild(h);
      }
      if (subtitle) head.appendChild(make('p','gtf-section-subtitle-v1',subtitle));
      section.appendChild(head);
    } else if (ariaLabel) section.setAttribute('aria-label',ariaLabel);
    const body = make('div','gtf-fields-v1');
    body.dataset.columns = String(columns);
    put(body,asNodes(content,'content'));
    section.appendChild(body);
    return section;
  }

  /** Form Field V1: labels/control states without owning their values. */
  function FormFieldV1({label,control,required,helper='',error='',width='full',placeholder}={}) {
    if (!label || !String(label).trim()) throw new TypeError('FormFieldV1 needs a label');
    if (!node(control) || !['INPUT','TEXTAREA','SELECT'].includes(control.tagName))
      throw new TypeError('FormFieldV1 needs an input, textarea or select');
    if (!['full','half'].includes(width)) throw new TypeError('width must be full or half');
    const field = make('div','gtf-field-v1 gtf-width-'+width);
    field.dataset.component = 'FormFieldV1';
    if (!control.id) control.id = 'gtf-input-'+(++serial);
    if (required !== undefined) control.required = Boolean(required);
    if (placeholder !== undefined && 'placeholder' in control) control.placeholder = String(placeholder);
    const text = make('label','gtf-label-v1',label);
    text.htmlFor = control.id;
    if (control.required) {
      const star = make('span','gtf-required-v1',' *');
      star.setAttribute('aria-hidden','true');
      text.appendChild(star);
    }
    field.append(text,control);
    const descriptions = [];
    const previous = control.getAttribute('aria-describedby');
    if (previous) descriptions.push(...previous.split(/\s+/).filter(Boolean));
    if (helper) {
      const help = make('p','gtf-help-v1',helper);
      help.id = control.id+'-help';
      field.appendChild(help);
      descriptions.push(help.id);
    }
    if (error) {
      const message = make('p','gtf-error-v1',error);
      message.id = control.id+'-error';
      message.setAttribute('role','alert');
      field.appendChild(message);
      descriptions.push(message.id);
      control.setAttribute('aria-invalid','true');
      field.dataset.invalid = 'true';
    }
    if (descriptions.length) control.setAttribute('aria-describedby',[...new Set(descriptions)].join(' '));
    return field;
  }

  function action(spec,kind) {
    if (node(spec)) {
      if (spec.tagName !== 'BUTTON') throw new TypeError('Form action must be a button');
      return spec;
    }
    if (!spec || !String(spec.label||'').trim()) throw new TypeError(kind+' action needs a label');
    const button = make('button','',spec.label);
    button.type = spec.type || (kind === 'primary' ? 'submit' : 'button');
    if (typeof spec.onClick === 'function') button.addEventListener('click',spec.onClick);
    if (spec.disabled) button.disabled = true;
    return button;
  }

  /** Form Actions V1: two equally wide buttons in approved order. */
  function FormActionsV1({primary,secondary,busy=false}={}) {
    const second = action(secondary,'secondary');
    const first = action(primary,'primary');
    const root = make('div','gtf-actions-v1');
    root.dataset.component = 'FormActionsV1';
    second.classList.add('gtf-action-secondary-v1');
    first.classList.add('gtf-action-primary-v1');
    if (busy) {
      first.disabled = true;
      root.setAttribute('aria-busy','true');
    }
    root.append(second,first);
    return root;
  }

  global.GameTraceFormComponents = Object.freeze({
    version:'1.0.0',FormParentV1,FormSectionV1,FormFieldV1,FormActionsV1
  });
})(typeof window !== 'undefined' ? window : globalThis);

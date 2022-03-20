import { ic5, idlFactory } from '../../declarations/ic5';
import { Principal } from '@dfinity/principal';
import { Actor, HttpAgent } from '@dfinity/agent';

var num_posts = -1;
var num_followed = -1;

let to_time = (target) => {
  const temp = Number(target) / 1000000;
  return new Date(temp).toLocaleString();
};

let nameClicked = async (e) => {
  let principal = e.target.id;
  let agent = new HttpAgent();
  let target_agent = Actor.createActor(idlFactory, {
    agent: agent,
    canisterId: Principal.fromText(principal),
  });
  let posts = await target_agent.posts(0);
  let name = await target_agent.get_name();

  console.log(principal);

  let section = document.getElementById('posts-selected');
  section.replaceChildren([]);

  for (let i = 0; i < posts.length; i++) {
    let post = document.createElement('p');
    post.innerText =
      posts[i].text + `\n${to_time(posts[i].time)}\n` + `Author: ${name}`;
    section.appendChild(post);
  }
};

let follow = async () => {
  document.getElementById('principal-error').innerText = '';
  let follow_area = document.getElementById('follow');
  let principal_txt = follow_area.value;
  try {
    let principal = Principal.fromText(principal_txt);
    ic5.follow(principal);
  } catch (error) {
    console.error('wrong principal format');
    document.getElementById('principal-error').innerText =
      'wrong principal format.';
  }
};

let load_followed = async () => {
  let followed = await ic5.follows();
  let followed_text = new Set();
  let table = document.getElementById('followed');

  if (followed.length === num_followed) return;
  num_followed = followed.length;

  table.replaceChildren([]);

  table.innerHTML = '<tr><th>Name</th><th>CanisterID</th></tr>';

  followed.forEach((e) => {
    followed_text.add(e.toText());
  });
  let followed_arr = Array.from(followed_text);
  for (let i = 0; i < followed_arr.length; i++) {
    let agent = new HttpAgent();
    let target_agent = Actor.createActor(idlFactory, {
      agent: agent,
      canisterId: Principal.fromText(followed_arr[i]),
    });

    try {
      let name = await target_agent.get_name();

      const table_item = `<tr><td><button id="${followed_arr[i]}">${name[0]}</button></td><td>${followed_arr[i]}</td></tr>`;
      table.innerHTML += table_item;
    } catch (error) {}
  }

  followed_arr.forEach((principal) => {
    document.getElementById(principal).onclick = nameClicked;
  });
};

let post = async () => {
  document.getElementById('error').innerText = '';
  let post_button = document.getElementById('post');
  post_button.disabled = true;
  let textarea = document.getElementById('message');
  let text = textarea.value;
  let otp = document.getElementById('otp').value;
  try {
    await ic5.post(otp, text);
  } catch (error) {
    console.error('wrong otp');
    document.getElementById('error').innerText = 'Post Failed.';
  }
  post_button.disabled = false;
};

let load_posts = async () => {
  let posts_section = document.getElementById('posts');
  let posts = await ic5.posts(0);
  let name = await ic5.get_name();

  if (num_posts === posts.length) return;

  posts_section.replaceChildren([]);

  num_posts = posts.length;

  for (let i = 0; i < posts.length; i++) {
    let post = document.createElement('p');
    post.innerText =
      posts[i].text + `\n${to_time(posts[i].time)}\n` + `Author: ${name}`;
    posts_section.appendChild(post);
  }
};

let load = () => {
  let post_button = document.getElementById('post');
  let follow_button = document.getElementById('follow-btn');
  post_button.onclick = post;
  follow_button.onclick = follow;
  load_posts();
  load_followed();

  setInterval(load_followed, 3000);
  setInterval(load_posts, 3000);
};

window.onload = load;

function get_election_index(year){
    return Math.floor((year-1792) / 4) + 1;
}

window.addEventListener("load",()=>{
    const usmap = document.querySelector("#USMapSVG");
    const states = usmap.querySelectorAll(".state path, circle.state");

    const parties_div = document.querySelector("#parties");
    const result_div = document.querySelector("#results");

    const year_select = document.querySelector("#year_list");
    let year_list_html = `<option value="1789">1789</option>`;
    for(let i = 1792; i <= 2020; i += 4){
        year_list_html += `<option value="${i}">${i}</option>`;
    }
    year_select.innerHTML = year_list_html;
    let random_year = 4*Math.floor(Math.random() * 58) + 1792;
    year_select.selectedIndex = String(get_election_index(random_year));

    document.querySelector("#random_year_btn").addEventListener("click",()=>{
        year_select.selectedIndex = String(Math.floor(Math.random() * elections.length));
    });  

    //game variables
    let current_election = {};
    let current_state_states = {};

    const get_settings = ()=>{
        let settings = {
            "year":1968,
            "amount":30
        };
        settings.year = Number(year_select.value);
        let amount_str = document.querySelector("#amount_to_change").value;
        amount_str = (!isNaN(amount_str)) ? Number(amount_str) : 30;
        settings.amount = amount_str;
        if (settings.amount == 0) settings.amount = 30;
        return settings;
    };

    const get_incorrect = (e)=>{
        let incorrect = {};
        let innum = 0;
        let in_state_html = "";
        for(let state in current_state_states){
            console.log(state);
            if(current_election.states[state].includes(current_state_states[state])) continue;
            innum++;
            let party = current_election.states[state];
            incorrect[state] = current_election.states[state];
            usmap.querySelector("#"+state.replaceAll(" ","_")).style.fill = "#000000";
            in_state_html += `<div class="cf hc"><div class="party_button" style="background-color:${party_colors[party]};"></div><p>${state}</p></div>`;
        }
        parties_div.style.display = "none";
        result_div.style.display = "block";

        let percent_wrong = (Object.keys(current_state_states).length - innum) / Object.keys(current_state_states).length * 100;
        result_div.querySelector("#wrong_text").innerHTML = `${innum} states wrong`;
        result_div.querySelector("#percent_text").innerHTML = `${percent_wrong.toFixed(2)}% score`;

        result_div.querySelector("#incorrect_states").innerHTML = in_state_html;

    };

    const new_game = (e)=>{

        parties_div.style.display = "block";
        result_div.style.display = "none";

        current_state_states = {};

        let settings = get_settings();
        document.querySelector("#year_text").innerHTML = `${settings.year} Presidential Election`;
        current_election = elections[get_election_index(settings.year)];
        settings.amount = Math.min(settings.amount, Object.keys(current_election.states).length);

        let new_party_html = "";
        for(let party of current_election.parties){
            new_party_html += `<div class="cf hc"><div class="party_button" style="background-color:${party_colors[party]};"></div><p>${party}</p></div>`;
        }
        document.querySelector("#party_list").innerHTML = new_party_html;

        console.log(current_election);
        console.log(get_election_index(settings.year));
        for(let st of states){
            st.style.fill = "#D0D0D0";
            st.classList.remove("active");
            let state_name = st.querySelector("title").innerHTML;
            if(state_name in current_election.states){
                current_state_states[state_name] = current_election.states[state_name][0];
                st.classList.add("active");
                st.style.fill = party_colors[current_election.states[state_name]];
            }
        }

        let state_list = Object.keys(current_election.states);
        for(let i = 0; i < settings.amount; i++){
            let rand_index = Math.floor(Math.random() * (state_list.length));
            let rand_state = state_list.splice(rand_index,1)[0];
            let rand_party_index = Math.floor(Math.random() * current_election.parties.length);
            let new_party = current_election.parties[rand_party_index];
            current_state_states[rand_state] = new_party;
            usmap.querySelector("#"+rand_state.replaceAll(" ","_")).style.fill = party_colors[new_party];
        }

    };

    for(let st of states){
        st.setAttribute("id", st.querySelector("title").innerHTML.replaceAll(" ","_"));
        st.addEventListener("click", e=>{
            if(!st.classList.contains("active")) return;
            let state_name = st.querySelector("title").innerHTML;
            let current_index = current_election.parties.indexOf(current_state_states[state_name]);
            let next_party = current_election.parties[(current_index + 1) % current_election.parties.length];
            current_state_states[state_name] = next_party;
            st.style.fill = party_colors[next_party];
        });
    }

    new_game();

    document.querySelector("#showbtn").addEventListener("click",get_incorrect);
    document.querySelector("#new_game").addEventListener("click",new_game);

});
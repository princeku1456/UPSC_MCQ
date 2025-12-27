const sfgData = {
  // "Test-1-Polity (321101)": [
  //   {
  //     text: "The Citizenship Act, 1955 deals with the determination of citizenship on or after",
  //     options: [
  //       "26th January, 1950",
  //       "26th November, 1949",
  //       "15th August, 1947",
  //       "14th August, 1947",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "The Citizenship Act, 1955 deals with the determination of citizenship on or after 26th January, 1950, which marks the commencement of the Act and the establishment of the Republic of India. While Article 5 of the Constitution defines citizenship at the time of its commencement (Jan 26, 1950), the 1955 Act provides for the acquisition and termination of citizenship after that date.",
  //   },
  //   {
  //     text: "The first session of the Constituent Assembly held on December 9, 1946 was presided by:",
  //     options: [
  //       "Dr. Rajendra Prasad",
  //       "B. N. Rau",
  //       "Sachidananda Sinha",
  //       "Jawaharlal Nehru",
  //     ],
  //     correctAnswer: 2,
  //     explanation:
  //       "The first session of the Constituent Assembly on December 9, 1946, was presided over by Dr. Sachidananda Sinha. He was appointed as the temporary chairman (provisional president) because he was the oldest member, following the French practice. Dr. Rajendra Prasad was later elected as the permanent President on December 11, 1946.",
  //   },
  //   {
  //     text: "With reference to the Preamble to the Constitution of India, consider the following objectives:\nI. Social equality\nII. Liberty of expression\nIII. Dignity of the individual\nIV. Political justice\nV. Welfare of the people\nVI. Equality of outcome\n\nHow many of the above objectives are explicitly mentioned in the Preamble to the Constitution of India?",
  //     options: ["Only three", "Only four", "Only five", "All the six"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Only three objectives are explicitly mentioned: Liberty of expression, Dignity of the individual, and Political justice. 'Social equality' is not explicitly used, though 'Justice - social, economic and political' and 'Equality of status and opportunity' are. 'Welfare of the people' and 'Equality of outcome' are not mentioned in the Preamble.",
  //   },
  //   {
  //     text: "With reference to the Constituent Assembly of India, consider the following statements:\nI. All the members of the Constituent Assembly were indirectly elected by the members of the Provincial Legislative Assemblies.\nII. Each seat in the Constituent Assembly represented approximately ten lakh people.\nIII. The composition of the Assembly was broadly in accordance with the scheme recommended by the Cabinet Mission Plan of 1946.\n\nWhich of the statements given above is/are correct?",
  //     options: [
  //       "I and II only",
  //       "III only",
  //       "II and III only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 2,
  //     explanation:
  //       "Statement I is incorrect because the Assembly was partly elected (representatives of British India) and partly nominated (representatives of Princely States). Statement II is correct as seats were distributed in proportion to population, roughly one seat per ten lakh people. Statement III is correct as the composition followed the scheme of the Cabinet Mission Plan of 1946.",
  //   },
  //   {
  //     text: "Consider the following statements:\n1. The Parliament of India can place a particular law in the Ninth Schedule of the Constitution of India.\n2. The validity of a law placed in the Ninth Schedule cannot be examined by any court and no judgement can be made on it.\n\nWhich of the statements given above is/are correct?",
  //     options: ["1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Statement 1 is correct; Parliament has the power to place laws in the Ninth Schedule. Statement 2 is incorrect because the Supreme Court ruled in the I.R. Coelho case (2007) that laws placed in the Ninth Schedule after April 24, 1973, are open to judicial review if they violate the basic structure of the Constitution or fundamental rights.",
  //   },
  //   {
  //     text: "With reference to the 'Objectives Resolution,' that was moved and adopted in the Constituent Assembly of India, consider the following statements:\nI. It was introduced in the Constituent Assembly by Dr. Bhim Rao Ambedkar.\nII. It emphasised upon adequate safeguards for minorities and the depressed classes.\nIII. It declared that all powers and authority of the Sovereign Independent India are derived from the people.\nIV. It was passed by the Constituent Assembly on 26th November 1949.\n\nWhich of the statements given above is/are correct?",
  //     options: ["I, II and III", "II and III only", "III and IV", "II only"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Statement I is incorrect; Jawaharlal Nehru introduced the resolution on December 13, 1946. Statement II is correct as it provided for safeguards for minorities and backward classes. Statement III is correct as it stated that all authority is derived from the people. Statement IV is incorrect; it was adopted on January 22, 1947.",
  //   },
  //   {
  //     text: "While framing the Constitution, the makers of the Indian Constitution drew inspiration from various sources. In this context, consider the following pairs:\nI. Prerogative Writs: United Kingdom\nII. Concurrent List of the Seventh Schedule: Canada\nIII. The process of impeachment of the President: Australia\nIV. Vesting of residuary powers with the Union Government: United States of America\n\nHow many of the pairs given above are correctly matched?",
  //     options: ["Only one", "Only two", "Only three", "All the four"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Only Pair I is correct; prerogative writs were adopted from the UK. Pair II is incorrect; the Concurrent List came from Australia. Pair III is incorrect; President's impeachment was inspired by the USA. Pair IV is incorrect; residuary powers with the Union was adopted from Canada.",
  //   },
  //   {
  //     text: "With reference to India Polity, consider the following statements:\nStatement I: India follows constitutional supremacy rather than parliamentary supremacy.\nStatement II: The Constitution came into effect before the first elected Parliament in the post independent India came into existence.\nStatements III: The Constitution specifies the composition and the powers of the Parliament.\n\nWhich one of the following is correct in respect of the statements given above?",
  //     options: [
  //       "Both statement II and statement III are correct and both of them explain statement I",
  //       "Both statement II and statement III are correct, but only one of them explains statement I",
  //       "Only one of the statements II and III is correct, and that explains statement I",
  //       "Neither Statement II nor statement III is correct",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "All statements are correct. Statement I is correct: India has constitutional supremacy. Statement II is correct (the Constitution came in 1950, first Parliament in 1952) but doesn't explain why the Constitution is supreme. Statement III explains Statement I because the Constitution defines and limits the Parliament's powers.",
  //   },
  //   {
  //     text: "Consider the following statements:\nStatement I: India is called a sovereign nation.\nStatement II: The states in India have no right to secede from the federation.\nStatement III: India can acquire any foreign territory according to the modes recognized by international law.\n\nWhich one of the following is correct in respect of the above statements?",
  //     options: [
  //       "Both Statement II and Statement III are correct and both of them explain Statement I",
  //       "Both Statement II and Statement III are correct but only one of them explains Statement I",
  //       "Only one of the Statements II and III is correct and that explains Statement I",
  //       "Neither Statement II nor Statement III is correct",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "Statement I is correct: India is a sovereign state. Statement II is correct: states cannot secede, but this relates to the federal structure, not direct sovereignty. Statement III is correct and explains sovereignty, as a sovereign state has the power to acquire or cede territory under international law.",
  //   },
  //   {
  //     text: "How does the political philosophy of the Indian Constitution differ from that of the western political philosophy?\nI. Classical western liberalism emphasizes on the primacy of individual rights over social justice, whereas the Indian constitution tries to balance the both.\nII. Unlike the western idea of secularism, Indian secularism advocates strict separation of State from religion.\n\nSelect the correct answer using the code given below:",
  //     options: ["I only", "II only", "Both I and II", "Neither I nor II"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Statement I is correct: Western liberalism prioritizes individual rights, while the Indian Constitution balances them with social justice (DPSPs). Statement II is incorrect because Western secularism advocates strict separation (mutual exclusion), whereas Indian secularism allows state intervention for social reform.",
  //   },
  //   {
  //     text: "Which one of the following is not a characteristic feature of the Indian Independence Act, 1947?",
  //     options: [
  //       "The Dominion of India got the residuary territory of India, excluding certain provinces.",
  //       "The Act sought to lay down a Constitution by the Legislative will of the British Parliament.",
  //       "The Act proposed to set up two independent Dominions.",
  //       "The Constituent Assembly of each Dominion was to have unlimited power to frame and adopt any Constitution.",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "Option 'b' is not a feature. The Act did not lay down a constitution; instead, it established two independent dominions and empowered their respective Constituent Assemblies to frame their own constitutions.",
  //   },
  //   {
  //     text: "Consider the following features:\nI. Defined territory\nII. Population\nIII. Organized Government\nIV. Sovereignty\nV. International Recognition\nVI. Written Constitution\n\nIn the context of political theory, how many of the above are considered as essential features of a State?",
  //     options: ["Only three", "Only four", "Only five", "All the six"],
  //     correctAnswer: 1,
  //     explanation:
  //       "In political theory, the four essential features are: Defined territory, Population, Organized Government, and Sovereignty. International recognition and a Written Constitution are not considered strictly essential for statehood.",
  //   },
  //   {
  //     text: "Consider the following statements:\nI. The provisions related to citizenship are contained in Part II of the Constitution of India.\nII. When a new territory becomes part of India, the Parliament decides which people from that area will get Indian citizenship.\nIII. If an Indian citizen acquires the citizenship of another country, he/she automatically ceases to be an Indian citizen.\n\nWhich of the statements given above is/are correct?",
  //     options: ["I only", "II and III only", "I and III only", "I, II and III"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Statement I is correct: Part II (Articles 5-11) contains citizenship provisions. Statement II is incorrect: the Government (not Parliament) issues an order specifying who becomes a citizen upon territory incorporation. Statement III is incorrect: while voluntary acquisition of foreign citizenship usually leads to loss of Indian citizenship, it is not 'automatic' in all cases, such as during a war unless the government directs.",
  //   },
  //   {
  //     text: "Consider the following statements:\nStatement I: A written Constitution is essential for democracy to survive and thrive in a country.\nStatement II: A written Constitution limits the power of the government.\n\nWhich one of the following is correct in respect of the above statements?",
  //     options: [
  //       "Both Statement I and Statement II are correct and Statement II explains Statement 1.",
  //       "Both Statement I and Statement II are correct, but Statement II does not explain Statement I.",
  //       "Statement I is correct, but Statement II is not correct.",
  //       "Statement I is not correct, but Statement II is correct.",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Statement I is incorrect; a written constitution is not essential, as seen in the UK. Statement II is correct; a written constitution provides a framework that limits government power and protects citizen rights.",
  //   },
  //   {
  //     text: "The right of the government to impose taxes and fees is provided in which List of Constitution?",
  //     options: [
  //       "VIth Schedule",
  //       "VIIth Schedule",
  //       "IXth Schedule",
  //       "XIth Schedule",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "The right of the government to impose taxes and fees is provided in Entry 82 of the Union List of the Seventh Schedule of the Constitution of India. This means that the Parliament has exclusive power to make laws on this subject.",
  //   },
  //   {
  //     text: "Which of the following is the primary reason for India to adopt a Parliamentary form of government?",
  //     options: [
  //       "To ensure separation of powers among organs of the State.",
  //       "To enable the people of India to have a direct role in electing their representatives.",
  //       "To ensure Parliamentary sovereignty in the governance process.",
  //       "To promote accountability of the executive to the legislature.",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "The primary reason is to promote executive accountability to the legislature. In this system, the executive (Cabinet) is drawn from the legislature and remains answerable to it, upholding collective responsibility.",
  //   },
  //   {
  //     text: "Consider the following leaders:\nI. Begum Aizaz Rasul\nII. Dakshayani Velayudhan\nIII. Vijyalakshmi Pandit\nIV. Hansa Jivraj Mehta\nV. Usha Mehta\n\nHow many of the above women leaders were members of the Constitution Assembly?",
  //     options: ["Only two", "Only three", "Only four", "All the five"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Four of these leaders were members: Begum Aizaz Rasul, Dakshayani Velayudhan, Vijayalakshmi Pandit, and Hansa Jivraj Mehta. Usha Mehta was a freedom fighter but not a member of the Constituent Assembly.",
  //   },
  //   {
  //     text: "Consider the following countries: India, France, Britain, USA. Arrange the countries in a chronological order as per the year of their adoption of Universal Adult Franchise?",
  //     options: [
  //       "Britain - USA - France - India",
  //       "USA - France - Britain - India",
  //       "Britain - France - India - USA",
  //       "USA - France - India - Britain",
  //     ],
  //     correctAnswer: 2,
  //     explanation:
  //       "The correct order is Britain (1928), France (1945), India (1950), and USA (1965). Although the USA granted voting rights earlier, true universal suffrage was only fully realized by 1965.",
  //   },
  //   {
  //     text: "Consider the following features:\nI. Single citizenship\nII. Independent judiciary\nIII. Appointment of Governors\nIV. Emergency Provisions\n\nHow many of the above are considered as the federal features of the Indian Constitution?",
  //     options: ["Only one", "Only two", "Only three", "All the four"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Only 'Independent judiciary' is a federal feature. Single citizenship, Appointment of Governors, and Emergency Provisions are considered unitary features as they strengthen the central government's control.",
  //   },
  //   {
  //     text: "Consider the following:\nI. Principle of one person, one vote, one value\nII. Rule of law\nIII. Free and fair elections\nIV. Reservation of seats in elections to minorities\n\nHow many of the above given practices are essential to uphold the principle of democracy in a country?",
  //     options: ["Only one", "Only two", "Only three", "All the four"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Three practices are essential: One person, one vote, one value, Rule of law, and Free and fair elections. Reservation of seats for minorities is a measure of affirmative action but not a core defining feature required for a country to be democratic.",
  //   },
  //   {
  //     text: "Democracy's superior virtue lies in the fact that it calls into activity-",
  //     options: [
  //       "the intelligence and character of ordinary men and women.",
  //       "the methods for strengthening executive leadership.",
  //       "a superior individual with dynamism and vision.",
  //       "a band of dedicated party workers.",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "Democracy depends on the consent and participation of the people. It requires decision-making by voters, which calls upon the intelligence and character of ordinary citizens.",
  //   },
  //   {
  //     text: "In the Constituent Assembly of India, who moved the resolution proposing that the National Flag of India be a 'horizontal tricolour of saffron, white, and dark green in equal proportion', with a navy-blue wheel at the centre:",
  //     options: [
  //       "Pingali Venkayya",
  //       "Sardar Vallabhbhai Patel",
  //       "Pattabhi Sitaramayya",
  //       "Jawaharlal Nehru",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Jawaharlal Nehru moved the resolution on July 22, 1947, to adopt the National Flag. While Pingali Venkayya is credited with designing the flag, it was Nehru who moved the official resolution in the Assembly.",
  //   },
  //   {
  //     text: "Consider the following personalities:\nI. K.M. Munshi\nII. B. N. Rau\nIII. Alladi Krishnaswami Ayyar\nIV. S. N. Mukherjee\nV. Gopalaswami Ayyangar\n\nHow many of the above were members of the Drafting Committee of the Indian Constitution?",
  //     options: ["Only two", "Only three", "Only four", "All the five"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Three of these were members: K.M. Munshi, Gopalaswami Ayyangar, and Alladi Krishnaswami Ayyar. B.N. Rau was the Constitutional Advisor, and S.N. Mukherjee was the Chief Draughtsman.",
  //   },
  //   {
  //     text: "With reference the Government of India Act, 1919 consider the following statements:\nStatement I: At the provincial level, the act introduced the concept of responsible government, though only in a limited sense.\nStatement II: The Act categorized provincial subjects into 'transferred' and 'reserved', where transferred subjects were administered by Indian ministers who were responsible to the provincial legislature.\n\nWhich one of the following is correct in respect of the above statements?",
  //     options: [
  //       "Both Statement I and Statement II are correct and Statement II explains Statement I",
  //       "Both Statement I and Statement II are correct but Statement II does not explain Statement I",
  //       "Statement I is correct but Statement II is not correct",
  //       "Statement I is not correct but Statement II is correct",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "Both statements are correct. Statement II explains Statement I because the 'limited' nature of responsibility was due to diarchy: only 'transferred' subjects were under ministers accountable to the legislature, while 'reserved' subjects remained under the non-accountable Governor.",
  //   },
  //   {
  //     text: "On 26th November 1949, which of the following provisions of the Constitution of India came into effect?\n1. Citizenship\n2. Elections\n3. Provisional Parliament\n4. Fundamental Rights\n\nSelect the correct answer using the codes given below:",
  //     options: ["2, 3 and 4", "1, 2 and 3", "1 and 3 only", "1 and 2 only"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Provisions relating to Citizenship (Articles 5-9), Elections (Article 324), and the Provisional Parliament came into force on Nov 26, 1949. Fundamental Rights did not come into effect until the formal commencement of the Constitution on Jan 26, 1950.",
  //   },
  //   {
  //     text: "The principles of liberty, equality and fraternity form a union of trinity and divorcing one from the other would defeat the very purpose of democracy. The above statement was made in the speech of which personality?",
  //     options: [
  //       "Dr. Rajendra Prasad",
  //       "Jawaharlal Nehru",
  //       "Mahatma Gandhi",
  //       "Dr. B.R. Ambedkar",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Dr. B.R. Ambedkar made this statement in his concluding speech to the Constituent Assembly on Nov 25, 1949. He emphasized that these principles form a union of trinity and cannot be separated without defeating democracy.",
  //   },
  //   {
  //     text: "Consider the following statements:\nStatement I: India transitioned from being a Dominion to a Republic on November 26, 1949.\nStatement II: The Constitution of India was adopted on November 26, 1949.\n\nWhich one of the following is correct in respect of the above statements?",
  //     options: [
  //       "Both Statement I and Statement II are correct and Statement II explains Statement I",
  //       "Both Statement I and Statement II are correct but Statement II does not explain Statement I",
  //       "Statement I is correct but Statement II is not correct",
  //       "Statement I is not correct but Statement II is correct",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Statement I is incorrect; India became a Republic on Jan 26, 1950, when the Constitution came into effect and the first President took office. Statement II is correct; the Constitution was adopted on Nov 26, 1949.",
  //   },
  //   {
  //     text: "How many of the following terms were added to the Preamble through the 42nd Constitutional Amendment Act, 1976?\nI. Socialist\nII. Secular\nIII. Fraternity\nIV. Equality of opportunity\nV. Dignity of the individual",
  //     options: ["Only two", "Only three", "Only four", "All the five"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Only two from this list were added: 'Socialist' and 'Secular'. The third term added by the 42nd Amendment was 'Integrity'. 'Fraternity', 'Equality of opportunity', and 'Dignity of the individual' were part of the original Preamble.",
  //   },
  //   {
  //     text: "With reference to a republic state, consider the following statements:\nI. In a republic state, the head of the state is always elected for a prescribed period.\nII. A country must be a 'republic' to be recognised as a democratic nation.\nIII. The idea of a republic adopted in India was borrowed from the Constitution of the United States of America.\n\nWhich of the statements given above is/are correct?",
  //     options: ["I only", "I and II", "II and III", "I and III"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Statement I is correct; a republic implies an elected head for a fixed term. Statement II is incorrect; a monarchy can also be a democracy (e.g., Britain). Statement III is incorrect; while the practice is similar to the USA, the concept of a republic in India was borrowed from the French Constitution.",
  //   },
  //   {
  //     text: "Consider the following statements:\nStatement I: In the Indian Constitution, the ethos of positive liberty is embedded.\nStatement II: In India, the State can impose reasonable restrictions on the liberty of citizens.\nStatement III: In India, the State facilitates the realization of certain rights and opportunities.\n\nWhich one of the following is correct in respect of the statements given above?",
  //     options: [
  //       "Both statement II and statement III are correct and both of them explain statement I",
  //       "Both statement II and statement III are correct, but only one of them explains statement I",
  //       "Only one of the statements II and III is correct, and that explains statement I",
  //       "Neither Statement II nor statement III is correct",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "All statements are correct. Positive liberty means having supportive conditions to develop oneself. Statement II explains positive liberty because reasonable restrictions ensure one person's freedom doesn't harm others. Statement III also explains it because the state actively facilitates rights and opportunities for personal development.",
  //   },
  //   {
  //     text: "One of the implications of equality in society is the absence of:",
  //     options: ["Privileges", "Restraints", "Competition", "Ideology"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Negative equality implies the absence of special rights and privileges for any class or individual. This ensures that all citizens are treated equally under the law.",
  //   },
  //   {
  //     text: "With reference to Non-Resident Indians (NRIs) and Overseas Citizens of India (OCI), consider the following statements:\nBoth NRIs and OCI cardholders-\nI. cannot acquire agricultural land in India by way of purchase.\nII. are required to register with the local police authorities, if the period of stay exceeds 180 days in India.\n\nWhich of the above given statements is/are correct?",
  //     options: ["I only", "II only", "Both I and II", "Neither I nor II"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Statement I is correct; neither NRIs nor OCIs can purchase agricultural land, plantation property, or farm houses in India. Statement II is incorrect; NRIs (as citizens) do not need to register, and OCI cardholders are specifically exempt from police registration regardless of their duration of stay.",
  //   },
  //   {
  //     text: "Consider the following pairs of Parts of the Indian Constitution and Subject Matter:\n1. Part VIII: The Union Territories\n2. Part X: The Scheduled and Tribal Areas\n3. Part XI: Relations between the Union and the States\n4. Part XII: Elections\n\nHow many of the pairs given above are correctly matched?",
  //     options: ["Only one", "Only two", "Only three", "All the four"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Three pairs are correct: Part VIII (UTs), Part X (Scheduled and Tribal Areas), and Part XI (Union-State relations). Pair 4 is incorrect; Part XII deals with Finance, Property, and Suits, while Elections are covered in Part XV.",
  //   },
  //   {
  //     text: "In general, which one of the following is a primary function of a Constitution?",
  //     options: [
  //       "It ensures complete separation among different organs of the state.",
  //       "It provides a set of ideals that reflects the moral and political identity of a country's citizens.",
  //       "It ensures equal distribution of wealth and resources among the citizens.",
  //       "It ensures that outcomes of the Parliamentary and assembly elections are always fair and free from disputes.",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "A constitution defines the shared values and moral identity of a society. While it establishes separation of powers, it's usually not 'complete' due to checks and balances. It provides a framework for economic goals and elections but cannot guarantee absolute equal distribution or dispute-free outcomes.",
  //   },
  //   {
  //     text: "The citizenship means\n1. full civil and political rights of the citizens.\n2. the right of suffrage for election to the House of the People and the Legislative Assembly.\n3. the right to become a Member of Parliament and Member of Legislative Assemblies.\n\nSelect the correct answer using the codes given below:",
  //     options: ["1 and 2 only", "1 and 3 only", "2 and 3 only", "All of these"],
  //     correctAnswer: 3,
  //     explanation:
  //       "Citizenship entails full civil and political rights. This includes the right to vote (suffrage) and the right to hold legislative office (MP/MLA), provided other criteria like age are met.",
  //   },
  //   {
  //     text: "Consider the following statements:\nStatement I: The Supreme Court of India is the custodian of the Constitution of India.\nStatement II: The Constitution of India establishes a single, integrated judicial system with the Supreme Court placed at its apex.\n\nWhich one of the following is correct in respect of the above statements?",
  //     options: [
  //       "Both Statement I and Statement II are correct and Statement II explains Statement I",
  //       "Both Statement I and Statement II are correct but Statement II does not explain Statement I",
  //       "Statement I is correct but Statement II is not correct",
  //       "Statement I is not correct but Statement II is correct",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "Both statements are correct. However, Statement II describes the hierarchical structure of the judiciary, while Statement I refers to the Court's function as a protector (via judicial review and writ jurisdiction). The unified structure doesn't inherently explain the 'custodian' role.",
  //   },
  //   {
  //     text: "Which of the following features essentially ensure constitutionalism in India?\nI. Rule of law\nII. Fundamental Rights to citizens\nIII. Separation of powers between different organs of Government\nIV. Judicial Review\n\nSelect the correct answer using the code given below:",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "I, II and III only",
  //       "I, II, III and IV",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "All four features ensure constitutionalism (limited government). Rule of law prevents arbitrary action. Fundamental Rights limit state power. Separation of powers provides checks and balances. Judicial review ensures constitutional supremacy.",
  //   },
  //   {
  //     text: "The Constituent Assembly of India performed which of the following functions?\nI. Ratified India's membership to the Commonwealth\nII. Elected Dr. Rajendra Prasad as India's first President\nIII. Adopted the National Flag of India\n\nSelect the correct answer using the code given below:",
  //     options: [
  //       "II and III only",
  //       "I and III only",
  //       "I and II only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "The Assembly performed all three functions: it ratified Commonwealth membership in May 1949, elected Dr. Rajendra Prasad as President on Jan 24, 1950, and adopted the National Flag on July 22, 1947.",
  //   },
  //   {
  //     text: "Consider the following statements:\nI. The Preamble to the Constitution of India can be amended by Parliament through a majority of the total membership of each House and two-thirds of the members present and voting.\nII. The Preamble is neither a source of power nor a prohibition upon the legislative power of the Parliament.\n\nWhich of the statements given above is/are correct?",
  //     options: ["I only", "II only", "Both I and II", "Neither I nor II"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Statement I is correct; the Preamble is amendable under Article 368 using a special majority. Statement II is correct as the Preamble states ideals but doesn't grant or restrict legislative power directly.",
  //   },
  //   {
  //     text: "The concept of 'A Union of States in the Indian Constitution' has been derived from-",
  //     options: [
  //       "The American Declaration of Independence",
  //       "The Australian Constitution",
  //       "The British North American Act",
  //       "The Swiss Constitution",
  //     ],
  //     correctAnswer: 2,
  //     explanation:
  //       "The concept of 'A Union of States' (a federation with a strong centre) was derived from the British North American Act, which refers to the Canadian Constitution.",
  //   },
  //   {
  //     text: "Which one of the following factors constitutes the best safeguard of liberty in a liberal democracy?",
  //     options: [
  //       "A committed judiciary",
  //       "Centralization of powers",
  //       "Elected government",
  //       "Separation of powers",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Separation of powers is the best safeguard as it divides functions among different organs, preventing the concentration of power and arbitrary excesses. Centralization is harmful to liberty, and an elected government or committed judiciary alone are not sufficient safeguards.",
  //   },
  //   {
  //     text: "Arrange the following committees/commissions related to the reorganization of States in India in chronological order: I. S.K. Dhar Commission, II. Fazl Ali Commission, III. JVP Committee.",
  //     options: ["I - III - II", "II - I - III", "II - III - I", "I - II - III"],
  //     correctAnswer: 0,
  //     explanation:
  //       "The chronological order is: S.K. Dhar Commission (June 1948), JVP Committee (December 1948), and Fazl Ali Commission (December 1953).",
  //   },
  //   {
  //     text: "To create a new state from an existing state in India, which one of the following Schedules of the Constitution needs to be amended?",
  //     options: [
  //       "First Schedule",
  //       "Third Schedule",
  //       "Seventh Schedule",
  //       "Eighth Schedule",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "The First Schedule must be amended as it lists all states and their territories. For example, the creation of Telangana in 2014 required an amendment to the First Schedule. Other schedules like the Third (oaths), Seventh (federal lists), or Eighth (official languages) are not strictly required to be changed just to demarcate new state boundaries.",
  //   },
  //   {
  //     text: "Under the Citizenship Act, 1955, a citizen of India who has acquired his/her citizenship through naturalization can lose his/her citizenship by way of deprivation if:\nI. s/he has obtained citizenship by fraud or concealment of material facts.\nII. s/he has shown disloyalty or disaffection towards the Constitution of India.\nIII. during a war, if s/he is found to have traded or communicated with the enemy in a manner that assists the enemy.\n\nWhich of the statements given above are correct?",
  //     options: [
  //       "I, II and III",
  //       "I and II only",
  //       "I and III only",
  //       "II and III only",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "A naturalized citizen can be deprived of citizenship for obtaining it by fraud, showing disloyalty to the Constitution, or unlawfully communicating/trading with an enemy during war.",
  //   },
  //   {
  //     text: "What was the exact constitutional status of India on 26th January, 1950?",
  //     options: [
  //       "A Democratic Republic",
  //       "A Sovereign Democratic Republic",
  //       "A sovereign Secular Democratic Republic",
  //       "A sovereign Socialist secular Democratic Republic",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "On Jan 26, 1950, the original Preamble declared India to be a 'Sovereign Democratic Republic'. The terms 'Socialist' and 'Secular' were added later by the 42nd Amendment in 1976.",
  //   },
  //   {
  //     text: "Consider the following:\nI. Speaker of the House of People\nII. Comptroller and Auditor General of India\nIII. Judge of the High Court\nIV. President\n\nHow many of the above constitutional posts are mentioned in both the second and third schedule of the Indian Constitution?",
  //     options: ["Only one", "Only two", "Only three", "All the four"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Only two posts are mentioned in both: the CAG and High Court Judges. The President's oath is in Article 60, and the Speaker does not have a specific separate oath prescribed in the Third Schedule.",
  //   },
  //   {
  //     text: "With reference to present procedure of granting citizenship in India, consider the following statements:\nStatement I: In India, the citizenship of a child is determined by the citizenship of his/her parents.\nStatement II: India currently follows the jus soli principle for determining a person's citizenship.\n\nWhich one of the following is correct in respect of the above statements?",
  //     options: [
  //       "Both Statement I and Statement II are correct and Statement II explains Statement I.",
  //       "Both Statement I and Statement II are correct, but Statement II does not explain Statement I.",
  //       "Statement I is correct, but Statement II is not correct.",
  //       "Statement I is not correct, but Statement II is correct.",
  //     ],
  //     correctAnswer: 2,
  //     explanation:
  //       "Statement I is correct; India now uses 'jus sanguinis' (right of blood), where a child's citizenship depends on the parents' status. Statement II is incorrect; 'jus soli' (right of soil) was used only until 1987.",
  //   },
  //   {
  //     text: "With reference to the Committees formed by the Constituent Assembly of India, consider the following pairs:\nI. States committee: Vallabhbhai Patel\nII. Union Powers Committee: Jawaharlal Nehru\nIII. Committee on Rules of Procedure: Rajendra Prasad\n\nHow many of the pairs given above are correctly matched?",
  //     options: ["Only one", "Only two", "All the three", "None"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Two pairs are correct: Union Powers Committee (Nehru) and Committee on Rules of Procedure (Rajendra Prasad). Pair I is incorrect; the States Committee was headed by Jawaharlal Nehru, not Patel.",
  //   },
  //   {
  //     text: "During British colonial rule in India, under which Act were Indians for the first time included in the Viceroy's Executive Council?",
  //     options: [
  //       "Indian Councils Act, 1861",
  //       "Indian Councils Act, 1892",
  //       "Indian Councils Act, 1909",
  //       "Government of India Act, 1919",
  //     ],
  //     correctAnswer: 2,
  //     explanation:
  //       "The Indian Councils Act of 1909 (Morley-Minto Reforms) first allowed Indians into the Executive Council. Satyendra Prasad Sinha was the first Indian appointed, serving as the Law Member.",
  //   },
  //   {
  //     text: "As per the Preamble of the Constitution of India, Fraternity does not aim to assure which of the following:",
  //     options: [
  //       "Dignity of the individual",
  //       "Unity of the nation",
  //       "Integrity of the nation",
  //       "Equality of status and opportunity for the citizens.",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Fraternity aims to assure the dignity of the individual and the unity and integrity of the nation. 'Equality of status and opportunity' is a separate objective distinct from the concept of Fraternity in the Preamble.",
  //   },
  // ],
  // "Test-2-Polity (321102)": [
  //   {
  //     text: "Which of the following Fundamental Rights are available only to the citizens of India and not to foreigners?\nI. Protection in respect of conviction for offences.\nII. Equality of opportunity in matters of public employment.\nIII. Freedom of speech and expression.\nIV. Protection of life and personal liberty.\nV. Right of minorities to establish and administer educational institutions.",
  //     options: [
  //       "I, II and IV only",
  //       "II, III and V only",
  //       "II, IV and V only",
  //       "I, III and IV only",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "Fundamental Rights available only to citizens include Articles 15, 16, 19, 29, and 30. In this list: Statement II (Article 16), Statement III (Article 19), and Statement V (Article 30) are exclusive to citizens. Statements I (Article 20) and IV (Article 21) are available to both citizens and foreigners.",
  //   },
  //   {
  //     text: "Which of the following Article(s) of the Constitution of India contains provisions related to the 'Right against Exploitation'?",
  //     options: [
  //       "Article 23 and 24",
  //       "Article 24 only",
  //       "Article 25 and 26",
  //       "Article 23 only",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "The 'Right against Exploitation' is covered under Articles 23 and 24 of the Indian Constitution. Article 23 prohibits traffic in human beings and forced labor, while Article 24 prohibits the employment of children in hazardous conditions.",
  //   },
  //   {
  //     text: "With reference to the Fundamental Rights, as enshrined in the Constitution of India, consider the following statements:\nI. They are meant for promoting the ideal of political democracy.\nII. They operate as limitations on the tyranny of the executive and arbitrary laws of the legislature.\nIII. They are sacrosanct and cannot be amended by the Parliament.\n\nWhich of the statements given above is/are correct?",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "I and III only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "Statement I is correct as Fundamental Rights promote political democracy. Statement II is correct because they limit the executive and legislature. Statement III is incorrect because they are not sacrosanct; Parliament can curtail or repeal them via a constitutional amendment, provided the 'basic structure' remains intact.",
  //   },
  //   {
  //     text: "The State shall not discriminate against any citizen on grounds only of religion, race, caste, sex, place of birth or any of them. This provision is provided in which Article of the Constitution of India?",
  //     options: ["Article 14", "Article 15", "Article 16", "Article 17"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Article 15 of the Constitution provides that the State shall not discriminate against any citizen on grounds only of religion, race, caste, sex, or place of birth.",
  //   },
  //   {
  //     text: "Under the Constitution of India, which one of the following is not a fundamental duty?",
  //     options: [
  //       "To vote in public elections",
  //       "To develop the scientific temper",
  //       "To safeguard public property",
  //       "To abide by the Constitution and respect its ideals",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "Voting in public elections is a legal or statutory right but is not listed as a Fundamental Duty under Article 51A. Developing scientific temper, safeguarding public property, and abiding by the Constitution are explicitly mentioned Fundamental Duties.",
  //   },
  //   {
  //     text: "Consider the following statements regarding the 'State' as defined under Article 12 of the Indian Constitution:\nI. It includes the Parliament and the State Legislatures.\nII. It includes all local authorities like municipalities and panchayats.\nIII. It includes statutory and non-statutory authorities like LIC, ONGC, and SAIL.\n\nWhich of the statements given above are correct?",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "I and III only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Article 12 defines 'State' to include the Government and Parliament of India, the Government and Legislatures of states, all local authorities, and other statutory or non-statutory authorities such as LIC, ONGC, and SAIL.",
  //   },
  //   {
  //     text: "Which of the following features of the Indian Constitution can be considered as 'reasonable' constraints on the freedom of citizens?\nI. National security\nII. Public order\nIII. Decency or morality\nIV. Contempt of court\nV. Defamation\n\nSelect the correct answer using the code given below:",
  //     options: [
  //       "I, II, and III only",
  //       "II, III, and IV only",
  //       "I, II, IV, and V only",
  //       "I, II, III, IV, and V",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Under Article 19(2), the State can impose 'reasonable restrictions' on freedom of speech and expression based on grounds including national security, public order, decency/morality, contempt of court, and defamation.",
  //   },
  //   {
  //     text: "Which of the following Constitutional Amendments added Fundamental Duties to the Constitution of India?",
  //     options: [
  //       "42nd Constitutional Amendment Act, 1976",
  //       "44th Constitutional Amendment Act, 1978",
  //       "86th Constitutional Amendment Act, 2002",
  //       "97th Constitutional Amendment Act, 2011",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "Fundamental Duties were added to the Constitution by the 42nd Constitutional Amendment Act in 1976 based on the recommendations of the Swaran Singh Committee.",
  //   },
  //   {
  //     text: "With reference to 'Article 13' of the Constitution of India, consider the following statements:\nI. It declares that all laws that are inconsistent with or in derogation of any of the fundamental rights shall be void.\nII. The term 'law' under Article 13 includes only permanent laws enacted by the Parliament or State Legislatures.\nIII. A Constitutional Amendment is considered a 'law' under Article 13 and can be challenged if it violates a Fundamental Right.\n\nWhich of the statements given above is/are correct?",
  //     options: ["I only", "I and II only", "II and III only", "I, II and III"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Statement I is correct as per Article 13. Statement II is incorrect because 'law' includes permanent laws, temporary laws (ordinances), and statutory instruments. Statement III is incorrect; a constitutional amendment is not considered a 'law' under Article 13, though it can be challenged under the 'basic structure' doctrine.",
  //   },
  //   {
  //     text: "The doctrine of 'Equal Protection of Laws' in the Indian Constitution is derived from which of the following sources?",
  //     options: [
  //       "British Constitution",
  //       "American Constitution",
  //       "Irish Constitution",
  //       "Canadian Constitution",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "The expression 'Equal Protection of Laws' is derived from the American Constitution and implies similar treatment under similar circumstances.",
  //   },
  //   {
  //     text: "Consider the following statements regarding 'Article 17' of the Indian Constitution:\nI. It abolishes 'untouchability' and forbids its practice in any form.\nII. The term 'untouchability' is defined in the Constitution of India.\nIII. The rights under Article 17 are available only against the State.\n\nWhich of the statements given above is/are correct?",
  //     options: ["I only", "I and II only", "II and III only", "I, II and III"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Statement I is correct. Statement II is incorrect; 'untouchability' is not defined in the Constitution or the Act. Statement III is incorrect; the right is available against both the State and private individuals.",
  //   },
  //   {
  //     text: "Which of the following Fundamental Rights cannot be suspended even during a National Emergency?",
  //     options: [
  //       "Right to Equality (Articles 14-18)",
  //       "Right to Freedom (Article 19)",
  //       "Protection in respect of conviction for offences and Protection of life and personal liberty (Articles 20 and 21)",
  //       "Right to Freedom of Religion (Articles 25-28)",
  //     ],
  //     correctAnswer: 2,
  //     explanation:
  //       "According to the 44th Amendment Act of 1978, the enforcement of rights guaranteed by Articles 20 and 21 cannot be suspended even during a National Emergency.",
  //   },
  //   {
  //     text: "The 'Rule of Law', as an essential part of the basic structure of the Indian Constitution, implies:\nI. Absence of arbitrary power.\nII. Equality before the law.\nIII. Primacy of individual rights.\n\nSelect the correct answer using the code given below:",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "I and III only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "In the Indian context, Rule of Law implies the absence of arbitrary power and equality before the law. Unlike the British model, individual rights in India are derived from the Constitution itself.",
  //   },
  //   {
  //     text: "Which of the following is/are the correct reasons for the inclusion of Directive Principles of State Policy (DPSPs) in the Constitution of India?\nI. To establish social and economic democracy.\nII. To ensure that the State remains accountable to the people in the long run.\nIII. To serve as moral precepts for the authorities of the State.\n\nSelect the correct answer using the code given below:",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "I and III only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "DPSPs aim to establish social and economic democracy. They ensure accountability because the government must answer to the people regarding implementation, and they serve as moral precepts for state authorities.",
  //   },
  //   {
  //     text: "With reference to the 'Directive Principles of State Policy' (DPSPs), consider the following statements:\nStatement I: DPSPs are non-justiciable in nature.\nStatement II: DPSPs are fundamental in the governance of the country.\nStatement III: The Parliament can amend the DPSPs through a constitutional amendment.\n\nWhich of the statements given above is/are correct?",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "I and III only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Statement I is correct as DPSPs are not legally enforceable by courts. Statement II is correct; Article 37 declares them fundamental in governance. Statement III is correct; Parliament can amend them provided the basic structure is maintained.",
  //   },
  //   {
  //     text: "Under the Indian Constitution, the provision for 'equal justice and free legal aid' is mentioned in:",
  //     options: [
  //       "Fundamental Rights",
  //       "Directive Principles of State Policy",
  //       "Fundamental Duties",
  //       "Preamble",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "Article 39A of the Directive Principles of State Policy, added by the 42nd Amendment, provides for equal justice and free legal aid.",
  //   },
  //   {
  //     text: "Which of the following pairs is/are correctly matched?\nI. Article 40: Organisation of village panchayats\nII. Article 44: Uniform Civil Code\nIII. Article 50: Promotion of international peace and security\n\nSelect the correct answer using the code given below:",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "I and III only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "Article 40 (Village Panchayats) and Article 44 (Uniform Civil Code) are correctly matched. Article 50 deals with the separation of judiciary from executive; Article 51 deals with international peace and security.",
  //   },
  //   {
  //     text: "Which of the following Fundamental Rights is/are available against the actions of both the State and private individuals?\nI. Prohibition of discrimination on grounds only of religion, race, caste, sex or place of birth.\nII. Abolition of untouchability.\nIII. Prohibition of traffic in human beings and forced labour.\nIV. Protection of life and personal liberty.\n\nSelect the correct answer using the code given below:",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "I, II and III only",
  //       "I, II, III and IV",
  //     ],
  //     correctAnswer: 2,
  //     explanation:
  //       "Articles 15, 17, and 23 are available against both State and private actions. Article 21 (Protection of life and personal liberty) is generally available only against State action.",
  //   },
  //   {
  //     text: "The Directive Principle which requires the State to 'protect and improve the environment and to safeguard forests and wildlife' was added by which amendment?",
  //     options: [
  //       "42nd Amendment Act",
  //       "44th Amendment Act",
  //       "86th Amendment Act",
  //       "97th Amendment Act",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "Article 48A, regarding the protection and improvement of the environment, was added by the 42nd Amendment Act of 1976.",
  //   },
  //   {
  //     text: "Which of the following is/are considered as 'Socialist' Directive Principles?\nI. To promote equal justice and free legal aid.\nII. To secure the right to work, education and public assistance.\nIII. To promote the educational and economic interests of SCs, STs and other weaker sections.\nIV. To secure a living wage and a decent standard of life for all workers.\n\nSelect the correct answer using the code given below:",
  //     options: [
  //       "I, II and III only",
  //       "I, II and IV only",
  //       "II, III and IV only",
  //       "I, II, III and IV",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "Socialist principles include Articles 39A, 41, and 43. Article 46 (Statement III) is classified as a 'Gandhian' principle.",
  //   },
  //   {
  //     text: "In which of the following cases did the Supreme Court rule that 'Fundamental Rights and Directive Principles are the two wheels of the chariot of the Constitution'?",
  //     options: [
  //       "Kesavananda Bharati Case (1973)",
  //       "Minerva Mills Case (1980)",
  //       "Golaknath Case (1967)",
  //       "Maneka Gandhi Case (1978)",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "In the Minerva Mills case (1980), the Supreme Court ruled that the Constitution is founded on the bedrock of the balance between Fundamental Rights and Directive Principles.",
  //   },
  //   {
  //     text: "With reference to the 'Fundamental Duties', consider the following statements:\nI. They were not part of the original Constitution.\nII. They are justiciable in nature and can be enforced by the courts.\nIII. They apply to both citizens and foreigners.\n\nWhich of the statements given above is/are correct?",
  //     options: ["I only", "I and II only", "II and III only", "I, II and III"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Statement I is correct; Fundamental Duties were added in 1976. Statement II is incorrect; they are non-justiciable. Statement III is incorrect; they apply only to citizens.",
  //   },
  //   {
  //     text: "Which of the following is/are the recommended functions of the Fundamental Duties as per the Verma Committee (1999)?\nI. To serve as a reminder to the citizens that they have duties towards their country.\nII. To serve as a warning against anti-national and anti-social activities.\nIII. To help the courts in determining the constitutional validity of a law.\n\nSelect the correct answer using the code given below:",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "I and III only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "The Verma Committee observed that Fundamental Duties remind citizens of their country, warn against anti-social activities, and assist courts in determining the constitutional validity of laws.",
  //   },
  //   {
  //     text: "Under Article 19, the 'Right to Freedom' includes:\nI. Right to assemble peacefully and without arms.\nII. Right to form associations or unions or co-operative societies.\nIII. Right to move freely throughout the territory of India.\nIV. Right to reside and settle in any part of the territory of India.\n\nSelect the correct answer using the code given below:",
  //     options: [
  //       "I, II and III only",
  //       "II, III and IV only",
  //       "I, III and IV only",
  //       "I, II, III and IV",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Article 19 guarantees rights including assembly, association, movement, and residence to citizens.",
  //   },
  //   {
  //     text: "Which of the following Fundamental Rights provides protection against both 'double jeopardy' and 'self-incrimination'?",
  //     options: ["Article 20", "Article 21", "Article 22", "Article 23"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Article 20 provides protection against ex-post-facto laws, double jeopardy, and self-incrimination.",
  //   },
  //   {
  //     text: "Consider the following statements regarding the 'Right to Education' (Article 21A):\nI. It was added by the 86th Constitutional Amendment Act, 2002.\nII. It makes free and compulsory education a Fundamental Right for children of the age of 6 to 14 years.\nIII. It provides for free education up to the higher secondary level.\n\nWhich of the statements given above are correct?",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "I and III only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "Statements I and II are correct. Statement III is incorrect; the right applies only to elementary education for children aged 6 to 14.",
  //   },
  //   {
  //     text: "Which of the following Fundamental Rights protects the 'Right to Privacy'?",
  //     options: ["Article 14", "Article 19", "Article 21", "Article 25"],
  //     correctAnswer: 2,
  //     explanation:
  //       "In the Justice K.S. Puttaswamy case (2017), the Supreme Court declared the Right to Privacy as an intrinsic part of the Right to Life and Personal Liberty under Article 21.",
  //   },
  //   {
  //     text: "With reference to 'Article 22' of the Indian Constitution, consider the following statements:\nI. It grants protection to persons who are arrested or detained.\nII. Punitive detention is to punish a person for an offence committed by him after trial and conviction.\nIII. Preventive detention is to prevent a person from committing an offence in the near future.\n\nWhich of the statements given above are correct?",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "I and III only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Statement I is correct. Punitive detention (Statement II) follows a trial and conviction, while preventive detention (Statement III) is to prevent a future offense without trial.",
  //   },
  //   {
  //     text: "The 'Writs' in the Indian Constitution, used for the enforcement of Fundamental Rights, are borrowed from which of the following?",
  //     options: [
  //       "American Constitution",
  //       "British Constitution",
  //       "Irish Constitution",
  //       "Australian Constitution",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "The prerogative writs (Habeas Corpus, Mandamus, etc.) are borrowed from English law (British Constitution).",
  //   },
  //   {
  //     text: "Which of the following writs can be issued against both public authorities and private individuals?",
  //     options: ["Habeas Corpus", "Mandamus", "Certiorari", "Quo-Warranto"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Habeas Corpus is the only writ that can be issued against both public authorities and private individuals.",
  //   },
  //   {
  //     text: "Consider the following statements regarding the writ of 'Mandamus':\nI. It is issued by a higher court to a lower court or a public official to perform a legal duty.\nII. It can be issued against a private individual.\nIII. It cannot be issued against the President of India or State Governors.\n\nWhich of the statements given above is/are correct?",
  //     options: ["I only", "I and II only", "I and III only", "I, II and III"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Statement I is correct. Statement II is incorrect; it cannot be issued against private individuals. Statement III is correct; it cannot be issued against the President or Governors.",
  //   },
  //   {
  //     text: "Which of the following Fundamental Rights provides protection to the cultural and educational rights of both 'religious' and 'linguistic' minorities?",
  //     options: ["Article 25", "Article 28", "Article 29", "Article 30"],
  //     correctAnswer: 3,
  //     explanation:
  //       "Article 30 grants all minorities—whether religious or linguistic—the right to establish and administer educational institutions. Article 29 protects the language, script, or culture of any section of citizens.",
  //   },
  //   {
  //     text: "Under 'Article 32' of the Indian Constitution, a citizen can move the Supreme Court directly for the enforcement of:\nI. Fundamental Rights.\nII. Directive Principles of State Policy.\nIII. Fundamental Duties.\nIV. Statutory Rights.\n\nSelect the correct answer using the code given below:",
  //     options: [
  //       "I only",
  //       "I and II only",
  //       "I and IV only",
  //       "I, II, III and IV",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "Article 32 provides a remedy for the enforcement of Fundamental Rights only.",
  //   },
  //   {
  //     text: "Which of the following Directive Principles is/are classified as 'Gandhian' Principles?\nI. To organise village panchayats.\nII. To promote cottage industries on an individual or co-operation basis in rural areas.\nIII. To prohibit the consumption of intoxicating drinks and drugs.\nIV. To organise agriculture and animal husbandry on modern and scientific lines.\n\nSelect the correct answer using the code given below:",
  //     options: [
  //       "I, II and III only",
  //       "II, III and IV only",
  //       "I, III and IV only",
  //       "I, II, III and IV",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "Gandhian principles include Articles 40, 43, and 47. Statement IV (Article 48) is classified as a Liberal-Intellectual principle.",
  //   },
  //   {
  //     text: "The 'Separation of Judiciary from Executive' is mentioned in which Article of the Indian Constitution?",
  //     options: ["Article 44", "Article 48", "Article 50", "Article 51"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Article 50 of the Directive Principles of State Policy mandates the State to separate the judiciary from the executive.",
  //   },
  //   {
  //     text: "Consider the following statements regarding 'Fundamental Duties':\nStatement I: They serve as a source of inspiration for citizens and promote a sense of discipline and commitment.\nStatement II: The Parliament can provide for the imposition of penalty or punishment for failure to fulfil any of the Fundamental Duties.\n\nWhich of the statements given above is/are correct?",
  //     options: ["I only", "II only", "Both I and II", "Neither I nor II"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Both statements are correct; duties serve as inspiration and Parliament can enact laws to impose penalties for violations.",
  //   },
  //   {
  //     text: "Which of the following is/are classified as 'Liberal-Intellectual' Directive Principles?\nI. To secure for all citizens a Uniform Civil Code throughout the country.\nII. To provide early childhood care and education for all children until they complete the age of six years.\nIII. To protect monuments, places and objects of artistic or historic interest.\nIV. To promote the educational and economic interests of SCs, STs and other weaker sections.\n\nSelect the correct answer using the code given below:",
  //     options: [
  //       "I, II and III only",
  //       "II, III and IV only",
  //       "I, III and IV only",
  //       "I, II, III and IV",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "Liberal-Intellectual principles include Articles 44, 45, and 49. Statement IV (Article 46) is a Gandhian principle.",
  //   },
  //   {
  //     text: "With reference to 'Article 25' of the Indian Constitution, consider the following statements:\nI. It guarantees the freedom of conscience and the right to freely profess, practice and propagate religion.\nII. This right is subject to public order, morality and health.\nIII. It allows the State to regulate or restrict any economic, financial, political or other secular activity associated with religious practice.\n\nWhich of the statements given above are correct?",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "I and III only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "All statements are correct; Article 25 covers conscience and practice, is subject to public order/health, and allows the State to regulate secular activities linked to religion.",
  //   },
  //   {
  //     text: "Under 'Article 26', every religious denomination or any section thereof shall have the right:\nI. To establish and maintain institutions for religious and charitable purposes.\nII. To manage its own affairs in matters of religion.\nIII. To own and acquire movable and immovable property.\nIV. To administer such property in accordance with law.\n\nSelect the correct answer using the code given below:",
  //     options: [
  //       "I, II and III only",
  //       "II, III and IV only",
  //       "I, III and IV only",
  //       "I, II, III and IV",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Article 26 guarantees religious denominations the right to establish institutions, manage religious affairs, and own/administer property.",
  //   },
  //   {
  //     text: "Which of the following Articles of the Constitution of India prohibits the State from compelling any person to pay taxes for the promotion of any particular religion?",
  //     options: ["Article 25", "Article 26", "Article 27", "Article 28"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Article 27 provides that no person shall be compelled to pay any taxes used specifically for the promotion of any particular religion.",
  //   },
  //   {
  //     text: "Consider the following statements regarding 'Article 28' of the Indian Constitution:\nI. No religious instruction shall be provided in any educational institution wholly maintained out of State funds.\nII. Religious instruction is permitted in institutions administered by the State but established under any endowment or trust.\nIII. In institutions recognised by the State or receiving aid out of State funds, no person shall be required to take part in any religious instruction without his consent.\n\nWhich of the statements given above are correct?",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "I and III only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "All statements are correct regarding religious instruction and types of educational institutions.",
  //   },
  //   {
  //     text: "The 'Abolition of Titles', except military and academic distinctions, is provided under which Article of the Indian Constitution?",
  //     options: ["Article 15", "Article 16", "Article 17", "Article 18"],
  //     correctAnswer: 3,
  //     explanation:
  //       "Article 18 abolishes titles, prohibiting the state from conferring them (except military/academic) and citizens from accepting them from foreign states.",
  //   },
  //   {
  //     text: "Which of the following Fundamental Rights provides protection against 'untouchability'?",
  //     options: [
  //       "Right to Equality",
  //       "Right to Freedom",
  //       "Right against Exploitation",
  //       "Right to Freedom of Religion",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "Article 17, which abolishes untouchability, falls under the category of Right to Equality (Articles 14-18).",
  //   },
  //   {
  //     text: "Under 'Article 24', the employment of children below what age is prohibited in any factory or mine?",
  //     options: ["12 years", "14 years", "16 years", "18 years"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Article 24 prohibits the employment of children below the age of 14 in factories, mines, or hazardous jobs.",
  //   },
  //   {
  //     text: "The 86th Constitutional Amendment Act, 2002 added which of the following Fundamental Duties?",
  //     options: [
  //       "To protect and improve the natural environment.",
  //       "To safeguard public property.",
  //       "To provide opportunities for education to his child or ward between the age of 6 and 14 years.",
  //       "To defend the country and render national service.",
  //     ],
  //     correctAnswer: 2,
  //     explanation:
  //       "The 86th Amendment Act of 2002 added the duty to provide educational opportunities to one's child or ward between the ages of 6 and 14.",
  //   },
  //   {
  //     text: "Which of the following is not a 'Fundamental Duty' under Article 51A?\nI. To uphold and protect the sovereignty, unity and integrity of India.\nII. To promote harmony and the spirit of common brotherhood.\nIII. To pay taxes regularly and on time.\nIV. To cherish and follow the noble ideals which inspired our national struggle for freedom.\n\nSelect the correct answer using the code given below:",
  //     options: ["I only", "II only", "III only", "IV only"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Paying taxes is not a listed Fundamental Duty in the Indian Constitution.",
  //   },
  //   {
  //     text: "The Directive Principle which requires the State to 'organise agriculture and animal husbandry on modern and scientific lines' is:",
  //     options: ["Article 44", "Article 46", "Article 47", "Article 48"],
  //     correctAnswer: 3,
  //     explanation:
  //       "Article 48 mandates the State to organize agriculture and animal husbandry on modern lines and prohibit the slaughter of cows.",
  //   },
  //   {
  //     text: "Under the Indian Constitution, 'protection of monuments and places and objects of national importance' is provided in:",
  //     options: ["Article 48", "Article 49", "Article 50", "Article 51"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Article 49 of Part IV (DPSPs) obliges the State to protect monuments and places declared to be of national importance.",
  //   },
  //   {
  //     text: "Which of the following Fundamental Rights provides protection against 'forced labour' and 'begar'?",
  //     options: ["Article 20", "Article 21", "Article 23", "Article 24"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Article 23 prohibits traffic in human beings, begar, and other forms of forced labor.",
  //   },
  //   {
  //     text: "Consider the following statements regarding the 'Fundamental Rights' and 'Directive Principles':\nI. Fundamental Rights are justiciable, while Directive Principles are non-justiciable.\nII. Fundamental Rights aim at establishing political democracy, while Directive Principles aim at establishing social and economic democracy.\nIII. In case of a conflict, the Fundamental Rights generally prevail over the Directive Principles.\n\nWhich of the statements given above are correct?",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "I and III only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "All statements are correct; FRs are justiciable and promote political democracy, while DPSPs are non-justiciable and promote social/economic democracy. FRs generally prevail in conflicts.",
  //   },
  // ],
  // "Test-3-Polity (321103)": [
  //   {
  //     text: "Which of the following are the essential requirements for a person to be appointed as a member of the Finance Commission?\n1. A Supreme Court judge or one qualified to be appointed as such.\n2. A person having wide experience in financial matters and administration.\n3. A person having special knowledge of economics.",
  //     options: ["1, 2 and 3", "1 and 2 only", "2 and 3 only", "1 and 3 only"],
  //     correctAnswer: 2,
  //     explanation:
  //       "The Chairman of the Finance Commission is selected from people with experience in public affairs. The other four members are selected from those who are, have been, or are qualified to be judges of a High Court; have knowledge of government finances or accounts; have had experience in administration and financial expertise; or have special knowledge of economics. Statement 1 is incorrect because the requirement is for a High Court judge, not a Supreme Court judge.",
  //   },
  //   {
  //     text: "With reference to the Constitution of India, consider the following provisions:\nI. Parliament can alter the boundaries of a State without the consent of that State.\nII. Only Parliament can initiate constitutional amendments under Article 368.\nIII. A money bill can be introduced in a state legislature only with the prior recommendation of the Governor of the state.\n\nHow many of the above provisions illustrate that the Indian Constitution has established a strong Centre?",
  //     options: ["Only one", "Only two", "All the three", "None"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Statement I is correct; under Articles 2 and 3, Parliament can alter state boundaries, and while the State Legislature's opinion is sought, it is not binding. Statement II is correct; only Parliament can initiate constitutional amendments under Article 368. Statement III does not illustrate Centre-State dominance; while a money bill requires the Governor's recommendation, this is a procedural requirement for financial discipline within the state and not an expansion of Parliament's authority over the State.",
  //   },
  //   {
  //     text: "Consider the following statements:\nStatement I: The Parliament has exclusive power to make a law imposing a tax which is not mentioned in any of the lists of the Seventh Schedule of the Constitution of India.\nStatement II: 'Any other matter not enumerated in List II or List III of the Seventh schedule, including any tax not mentioned in either of those Lists' is one of the entries under Union List of the Seventh Schedule.\n\nWhich one of the following is correct in respect of the above statements?",
  //     options: [
  //       "Both Statement I and Statement II are correct, and Statement II explains Statement I",
  //       "Both Statement I and Statement II are correct but Statement II does not explain Statement I",
  //       "Statement I is correct, but Statement II is not correct",
  //       "Statement I is not correct, but Statement II is correct",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "Both statements are correct. In India, Parliament holds exclusive residuary power of taxation under Article 248. This is supported by Entry 97 of the Union List in the Seventh Schedule, which includes any matter (including tax) not enumerated in List II or List III. Thus, Statement II provides the constitutional basis for Statement I.",
  //   },
  //   {
  //     text: "In the context of Indian polity, consider the following statements:\nStatement I: The Central Government can impose annual Net Borrowing Ceiling (NBC) on certain Indian states to regulate their borrowings.\nStatement II: Article 293 of the Indian constitution empowers the central government to impose restrictions on any type of borrowing by any State in India.",
  //     options: [
  //       "Both Statement I and Statement II are correct, and Statement II explains Statement I",
  //       "Both Statement I and Statement II are correct but Statement II does not explain Statement I",
  //       "Statement I is correct, but Statement II is not correct",
  //       "Statement I is not correct, but Statement II is correct",
  //     ],
  //     correctAnswer: 2,
  //     explanation:
  //       "Statement I is correct; the Central Government imposes a Net Borrowing Ceiling (NBC) based on Finance Commission recommendations to limit state borrowing as a percentage of GSDP. Statement II is incorrect; Article 293 does not grant a blanket power. Article 293(3) only allows the Centre to impose conditions on State borrowing if that State has outstanding loans or guarantees from the Central Government.",
  //   },
  //   {
  //     text: "The Sarkaria Commission was constituted in 1983 to address the growing concerns related to Centre-State relations in India. In this context, which of the following was not recommended by the Sarkaria Commission?",
  //     options: [
  //       "Appointing an eminent person who is from outside the state as Governor of that state.",
  //       "Strengthening of All-India Services",
  //       "Setting up a permanent Inter-State Council under Article 263",
  //       "Discontinuation of the Three-Language Formula in education to avoid centre-state conflicts on this issue.",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "The Sarkaria Commission did not recommend the discontinuation of the Three-Language Formula. Instead, it recommended steps to uniformly implement the formula in its true spirit to foster national unity and linguistic harmony. It did recommend appointing eminent outsiders as Governors, strengthening All-India Services, and setting up a permanent Inter-State Council.",
  //   },
  //   {
  //     text: "During the President's Rule in a State under Article 356 of the Constitution of India, the State Legislative Assembly is dissolved by which of the following authority?",
  //     options: [
  //       "Parliament of India.",
  //       "President of India",
  //       "Chief justice of High Court",
  //       "Governor of the state",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "Under Article 356, the President has the power to dissolve the Legislative Assembly of the concerned state. However, as established in the S.R. Bommai case (1994), the Assembly cannot be dissolved until the proclamation is approved by both Houses of Parliament; until then, it can only be suspended.",
  //   },
  //   {
  //     text: "Consider the following states:\nI. Jharkhand\nII. Goa\nIII. Sikkim\n\nHow many of the above states were granted full statehood through Constitutional Amendments, rather than through ordinary legislative acts of Parliament?",
  //     options: ["Only one", "Only two", "All the three", "None"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Jharkhand was created via an ordinary act (the Bihar Reorganization Act, 2000). Goa was granted statehood via the 56th Constitutional Amendment Act of 1987. Sikkim became a full state through the 36th Constitutional Amendment Act of 1975. Thus, only two (Goa and Sikkim) were granted statehood through constitutional amendments.",
  //   },
  //   {
  //     text: "Consider the following Indian States:\nI. Haryana\nII. Chhattisgarh\nIII. Arunachal Pradesh\nIV. Meghalaya\n\nArrange the above chronologically based on the year of their establishment as a state of the Indian Union?",
  //     options: ["I-IV-III - II", "IV-I-II-III", "I-III-IV- П", "III-I-IV-II"],
  //     correctAnswer: 0,
  //     explanation:
  //       "The chronological order is: Haryana (1966), Meghalaya (1972), Arunachal Pradesh (1987), and Chhattisgarh (2000). Haryana was created from Punjab; Meghalaya was granted full statehood in 1972; Arunachal Pradesh was upgraded in 1987; and Chhattisgarh was carved out of Madhya Pradesh in 2000.",
  //   },
  //   {
  //     text: "The Part XXI of the Constitution of India contains Temporary, Transitional and Special Provisions related to various states. In this context consider the following states:\nI. Gujarat\nII. Goa\nIII. Sikkim\nIV. Odisha\nV. Chhattisgarh\nVI. Tamil Nadu\nVII. Mizoram\n\nProvisions related to how many of the above states are included in Part XXI of the Constitution?",
  //     options: ["Only four", "Only five", "Only six", "All the seven"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Provisions for four states are included: Gujarat (Article 371), Goa (Article 371-I), Sikkim (Article 371F), and Mizoram (Article 371G). Odisha, Chhattisgarh, and Tamil Nadu do not have special provisions under Part XXI.",
  //   },
  //   {
  //     text: "With reference to the electoral system in India, consider the following functions:\n1. Fixing dates for General election to the House of People\n2. Postponing elections to a State Legislative Assembly\n3. Appointment of the Chief Electoral Officer at the State level\n4. De-registering the political parties if they do not participate in any elections for a prolonged period.\n\nHow many of the above are the functions of the Election commission of India?",
  //     options: ["Only one", "Only two", "Only three", "All the four"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Functions 1, 2, and 3 are correct. The ECI determines election schedules, can postpone elections due to issues like violence, and designates a Chief Electoral Officer for each state. Function 4 is incorrect; the Supreme Court held in the Indian National Congress v. Institute of Social Welfare case that the ECI does not have the authority to de-register a political party for failing to participate in elections.",
  //   },
  //   {
  //     text: "What are the duties of the Chief of Defence Staff (CDS) as Head of the Department of Military Affairs?\n1. Permanent Chairman of Chiefs of Staff Committee\n2. Exercise military command over the three Service Chiefs\n3. Principal Military Advisor to Defence Minister on all tri-Service matters",
  //     options: ["1, 2 and 3", "1 and 2 only", "2 and 3 only", "1 and 3 only"],
  //     correctAnswer: 3,
  //     explanation:
  //       "The CDS functions as the Permanent Chairman of the Chiefs of Staff Committee (Statement 1) and as the Principal Military Advisor to the Defence Minister on tri-Service matters (Statement 3). Statement 2 is incorrect because the CDS does not exercise military command over the Service Chiefs, ensuring impartial advice to the political leadership.",
  //   },
  //   {
  //     text: "To implement international treaties, Parliament is empowered to make laws on subjects mentioned in the State List of the Seventh Schedule of the Constitution. Such a law:",
  //     options: [
  //       "is required to be passed by Parliament with simple majority in both houses and also requires consent from at least half of the states.",
  //       "is required to be passed by the Rajya Sabha with a majority of two-thirds of the members present and voting and given an asset by the Lok Sabha.",
  //       "must be passed by both houses of the parliament with a majority of two-thirds of the members present and voting in each house.",
  //       "can be passed by Parliament with simple majority in both houses, without requiring any consent from the States.",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Under Article 253, Parliament can enact laws to implement international treaties on State List subjects. Such laws are treated as Ordinary Bills requiring only a simple majority in both houses and do not require any consent from the States.",
  //   },
  //   {
  //     text: "With reference to legislative powers of the Parliament of India and state legislative assemblies, consider the following statements:\nI. Only Parliament by law can exclude the jurisdiction of a High Court from any Union Territory.\nII. Only the Parliament can make laws related to citizenship.\nIII. Only Parliament can make laws with respect to the Goods and Services Tax (GST) where the supply of goods, or services takes place in the course of inter-State trade or commerce.",
  //     options: ["I only", "II and III only", "I and II only", "I, II and III"],
  //     correctAnswer: 3,
  //     explanation:
  //       "All statements are correct. Article 230 empowers only Parliament to extend or exclude High Court jurisdiction from a UT. Article 11 gives Parliament exclusive power over citizenship laws. Article 246A gives Parliament exclusive power to make laws for GST on inter-State trade.",
  //   },
  //   {
  //     text: "In the context of Indian Polity, with reference to the limitations to the territorial jurisdictions of Parliament consider the following statements:\nI. The Fifth Schedule of the Constitution empowers the President to declare that specific Acts of Parliament will not apply to Scheduled Areas in a State.\nII. The Sixth Schedule empowers the Governor of Assam to direct that certain Acts of Parliament will not apply to autonomous districts in Assam.",
  //     options: ["I only", "II only", "Both I and II", "Neither I nor II"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Statement I is incorrect because the Fifth Schedule empowers the Governor of a State, not the President, to direct that an Act of Parliament does not apply to a Scheduled Area. Statement II is correct as per the Sixth Schedule, which gives the Governor of Assam this power for autonomous districts.",
  //   },
  //   {
  //     text: 'With reference to the "Tea Board" in India, consider the following statements:\n1. The Tea Board is a statutory body.\n2. It is a regulatory body attached to the Ministry of Agriculture and Farmers Welfare.\n3. The Tea Board\'s Head Office is situated in Bengaluru.\n4. The Board has overseas offices in Dubai and Moscow.',
  //     options: ["1 and 3", "2 and 4", "3 and 4", "1 and 4"],
  //     correctAnswer: 3,
  //     explanation:
  //       "The Tea Board is a statutory body (Statement 1) under the Ministry of Commerce (not Agriculture). Its head office is in Kolkata (not Bengaluru). It has several overseas offices, including in Moscow and Dubai (Statement 4).",
  //   },
  //   {
  //     text: "Consider the following statements about Centre-State legislative relation when an Emergency is proclaimed under Article 352 of the Indian Constitution:\nI. While the proclamation of emergency is in operation, the power of State Legislatures to make laws on the State List subjects is suspended.\nII. The laws made by Parliament on State List subjects while the proclamation of emergency was in operation will continue only for six months after the proclamation has ceased to operate.",
  //     options: ["I only", "II only", "Both I and II", "Neither I nor II"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Statement I is incorrect; State Legislatures are not suspended during a National Emergency and can still legislate, though Parliamentary law prevails in case of conflict. Statement II is correct; under Article 250(2), laws made by Parliament on state subjects during an emergency cease to have effect six months after the emergency ends.",
  //   },
  //   {
  //     text: "As per the Constitution of India, which of the following is authorized to delegate the functions in relation to any matter to which the executive power of the State extends, to the Government of India?",
  //     options: [
  //       "The Legislature of the State with consent of the Government of India",
  //       "The President of India with consent of Legislature of the State",
  //       "The Governor of the State with consent of the Parliament of India.",
  //       "The Governor of the State with consent of the Government of India.",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Under Article 258A, the Governor of a State may, with the consent of the Government of India, entrust State executive functions to the Union Government or its officers.",
  //   },
  //   {
  //     text: "In the context of Indian Polity, consider the following statements:\nStatement I: Final judgments or orders delivered or passed by civil courts in any part of the territory of India are capable of execution anywhere within that territory according to law.\nStatement II: According to the Constitution of India, all the Civil Courts in India act as court of records.",
  //     options: [
  //       "Both Statement I and Statement II are correct and Statement II explains Statement I",
  //       "Both Statement I and Statement II are correct but Statement II does not explain Statement I",
  //       "Statement I is correct but Statement II is not correct",
  //       "Statement I is not correct but Statement II is correct",
  //     ],
  //     correctAnswer: 2,
  //     explanation:
  //       "Statement I is correct per Article 261(3). Statement II is incorrect because the Constitution only designates the Supreme Court (Article 129) and High Courts (Article 215) as Courts of Record; Civil Courts do not have this status.",
  //   },
  //   {
  //     text: "With reference to the Inter-State Council in India, consider the following statements:\nI. The Constitution makes it mandatory for the President to establish the Inter-State Council every fifth year.\nII. The Inter-State Council possesses adjudicating power on disputes between the State Governments and between Union and the State Governments.",
  //     options: ["I only", "II only", "Both I and II", "Neither I nor II"],
  //     correctAnswer: 3,
  //     explanation:
  //       "Statement I is incorrect; Article 263 empowers the President to establish the Council if it's in the public interest, but there's no five-year mandate. Statement II is incorrect; the Inter-State Council is an advisory body and does not have adjudicatory powers.",
  //   },
  //   {
  //     text: "Who holds the final authority to dismiss or remove an All India Services officer, posted in a State, from the service?",
  //     options: [
  //       "The President of India",
  //       "The Governor of the State",
  //       "Union Public Service Commission",
  //       "The Civil Services Board (CSB)",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "As per Article 311, no member of an All-India Service can be dismissed by an authority subordinate to the appointing authority. Since the President is the appointing authority (Article 310), only the President holds the final power of dismissal.",
  //   },
  //   {
  //     text: "Who among the following is not associated to the Governing Council of NITI Aayog?",
  //     options: [
  //       "The Prime Minister",
  //       "The President",
  //       "The Chief Ministers of States",
  //       "The Chief Ministers of Union Territories",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "The Governing Council of NITI Aayog consists of the Prime Minister, Chief Ministers of all States and UTs with legislatures, and Lt Governors of other UTs. The President of India is not a member of the Council.",
  //   },
  //   {
  //     text: "Consider the following statements regarding provisions related to grants from the Union to certain States under Article 275 of the Constitution of India:\nI. The Union can grant aid to States for any public purpose which may not be mentioned in any existing statute.\nII. They are given to states based on the recommendations of the Finance Commission.",
  //     options: ["I only", "II only", "Both I and II", "Neither I nor II"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Statement I describes discretionary grants under Article 282. Statement II is correct; Article 275 deals with statutory grants, which are charged on the Consolidated Fund and provided based on Finance Commission recommendations.",
  //   },
  //   {
  //     text: "In the context of fiscal federalism during the British rule in India, which one of the following Acts for the first time provided a complete separation between the Central and the Provincial heads of revenue?",
  //     options: [
  //       "Indian Councils Act, 1909",
  //       "Indian Councils Act, 1892",
  //       "Government of India Act, 1919",
  //       "Government of India Act, 1935",
  //     ],
  //     correctAnswer: 2,
  //     explanation:
  //       "The Government of India Act, 1919 (Montagu-Chelmsford Reforms) first introduced a clear separation of revenue heads between the Centre and Provinces to operationalize the 'Dyarchy' system.",
  //   },
  //   {
  //     text: "The 42nd Constitutional Amendment Act, 1976, transferred which of the following subjects from the State List to the Concurrent List of the Seventh Schedule of the Constitution of India?\nI. Forests\nII. Newspapers, books and printing presses\nIII. Protection of wild animals and birds\nIV. Social security and social insurance\nV. Maintenance of land records",
  //     options: [
  //       "I and III only",
  //       "II, IV and V only",
  //       "I, II and III only",
  //       "I, III and IV only",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "The 42nd Amendment transferred five subjects: Education, Forests, Weights and Measures, Protection of Wild Animals and Birds, and Administration of Justice. Newspapers and Social Security were already in the Concurrent List, and Land Records remains in the State List.",
  //   },
  //   {
  //     text: "Which of the following States/UTs are included in the Northern Zonal Council?",
  //     options: [
  //       "Uttarakhand, Uttar Pradesh, Haryana, Punjab, Jammu and Kashmir",
  //       "Haryana, Punjab, Himachal Pradesh, Rajasthan and NCT of Delhi",
  //       "Uttar Pradesh, Uttarakhand, Punjab, Haryana and Rajasthan",
  //       "Uttarakhand, Uttar Pradesh, Himachal Pradesh, Punjab and Haryana",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "The Northern Zonal Council comprises Haryana, Punjab, Himachal Pradesh, Rajasthan, NCT of Delhi, Chandigarh, Ladakh, and J&K. Uttar Pradesh and Uttarakhand belong to the Central Zonal Council.",
  //   },
  //   {
  //     text: "Which of the following statements with regard to the Election Commission of India (ECI) is/are correct?\nI. According to the Constitution of India, the Election commission of India consists of a Chief Election Commissioner and two other election commissioners.\nII. The Chief Election Commissioner can only be removed from office in like manner and on the like grounds as a Judge of the Supreme Court of India.\nIII. No civil or criminal proceedings can be initiated against the Chief Election Commissioner or the Election Commissioners for actions taken in the discharge of their official duties.",
  //     options: [
  //       "I and II only",
  //       "II and III only",
  //       "III only",
  //       "I, II and III",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "Statement I is incorrect; Article 324(2) says the ECI shall consist of the CEC and such number of other commissioners as the President may fix. Statement II is correct regarding the removal process. Statement III is correct per the 2023 Act, which grants legal protection for official acts.",
  //   },
  //   {
  //     text: "Consider the following constitutional authorities in India:\nI. Comptroller and Auditor General of India (CAG)\nII. Attorney General of India\nIII. The Chairman of the Union Public Service Commission (UPSC)\nIV. Members of the Finance Commission\n\nHow many of the above, after they cease to hold respective offices, are eligible to further hold any other office under the Government of India or under the Government of a State?",
  //     options: ["Only one", "Only two", "Only three", "All the four"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Only two are eligible: the Attorney General and members of the Finance Commission. The CAG (Article 148(4)) and the Chairman of the UPSC (Article 319) are ineligible for further government office after their tenure.",
  //   },
  //   {
  //     text: "Consider the following bodies:\nI. National Human Rights Commission (NHRC)\nII. Lokpal\nIII. Central Vigilance Commission (CVC)\nIV. Central Information Commission (CIC)\n\nThe committee making recommendation for appointment of members to how many of the above bodies consist of the Speaker of Lok Sabha?",
  //     options: ["Only one", "Only two", "Only three", "All the four"],
  //     correctAnswer: 1,
  //     explanation:
  //       "The Speaker of Lok Sabha is a member of the selection committees for only two of these: NHRC and Lokpal. The Speaker is not part of the selection committees for the CVC or the CIC.",
  //   },
  //   {
  //     text: "Consider the following organizations/ bodies in India:\nI. Central Pay Commission\nII. Anusandhan National Research Foundation (ANRF)\nIII. Unique Identification Authority of India (UIDAI)\n\nHow many of the above are statutory bodies?",
  //     options: ["Only one", "Only two", "All the three", "None"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Two are statutory: ANRF (2023 Act) and UIDAI (2016 Act). The Central Pay Commission is an ad hoc advisory body constituted by executive resolution, not by an Act of Parliament.",
  //   },
  //   {
  //     text: "The President may by order remove from office the Chairman or any other member of the Union Public Service Commission if:\nI. s/he is adjudged an insolvent.\nII. s/he engages during his/her term of office in any paid employment outside the duties of his/her office.\nIII. s/he, in the opinion of the President, unfit to continue in office by reason of infirmity of mind or body.",
  //     options: [
  //       "I, II and III",
  //       "I and III only",
  //       "I and II only",
  //       "II and III only",
  //     ],
  //     correctAnswer: 0,
  //     explanation:
  //       "All three statements are correct under Article 317(3) of the Constitution, which specifies the grounds upon which the President may directly remove a UPSC member.",
  //   },
  //   {
  //     text: "In India, other than ensuring that public funds are used efficiently and for the intended purpose, what is the importance of the office of the Comptroller and Auditor General (CAG)?\n1. CAG exercises exchequer control on behalf of the Parliament when the President of India declares national emergency/financial emergency.\n2. CAG reports on the execution of projects or programmes by the ministries which are discussed by the Public Accounts Committee.\n3. Information from CAG reports can be used by investigating agencies to press charges against those who have violated the law while managing public finances.\n4. While dealing with the audit and accounting of government companies, CAG has certain judicial powers for prosecuting those who violate the law.",
  //     options: ["1, 2 and 4 only", "2 only", "2 and 3 only", "1, 2, 3 and 4"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Statements 2 and 3 are correct; CAG reports are discussed by the PAC and can be used by investigators. Statement 1 is incorrect as the CAG has no exchequer control function. Statement 4 is incorrect because the CAG does not possess any judicial powers.",
  //   },
  //   {
  //     text: "With reference to the National Commission for Scheduled Tribes (NCST), consider the following statements:\nI. It is mandatory to have at least one woman member in the Commission.\nII. As per the Constitution of India, it will annually submit a report to the Parliament relating to the working of the commission.\nIII. It has all the powers of a civil court while summoning any person from any part of India and examining him on oath.",
  //     options: ["I only", "II and III only", "I and III only", "I, II and III"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Statement I is correct (one woman member is mandatory). Statement II is incorrect because the NCST submits its report to the President, who then has it laid before Parliament. Statement III is correct; it has civil court powers for investigations.",
  //   },
  //   {
  //     text: "With reference to 'Special Officer for Linguistic Minorities', consider the following statements:\nI. Based on the recommendations of States Reorganisation Commission (SRC) 1956, a provision related to Special Officer for linguistic minorities was added to the Constitution of India.\nII. The officer is responsible for identifying linguistic minorities in the state and declaring the same.",
  //     options: ["I only", "II only", "Both I and II", "Neither I nor II"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Statement I is correct; Article 350-B was added by the 7th Amendment, 1956, following SRC recommendations. Statement II is incorrect; the officer investigates safeguards, but the identification of linguistic minorities is done by the respective States/UTs.",
  //   },
  //   {
  //     text: "With reference to the organizations/bodies in India, consider the following information:\nI. NCSC members' salaries are determined by the President, and they hold office for four years.\nII. SIC members' salaries are determined by the State Legislature, and they hold office for three years.\nIII. SHRC members' salaries are determined by the State Government, and they serve a term of 5 years or until age 70.\nIV. CVC members hold office for a term of 6 years or until age 65.\n\nIn how many of the above rows is the information correctly matched?",
  //     options: ["Only one", "Only two", "Only three", "All the four"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Only Row III is correct. SHRC members' salaries are set by the State Government, and they serve for 3 years (eligible for re-appointment up to 5) or until 70. NCSC tenure is 3 years (Row I wrong). SIC salaries are set by the Central Government (Row II wrong). CVC tenure is 4 years (Row IV wrong).",
  //   },
  //   {
  //     text: "M.M. Punchhi Commission on Centre-State Relationship has recommended the disposal of a bill reserved for the consideration of the Union Executive within-",
  //     options: ["Four months", "Six months", "Eight months", "Five months"],
  //     correctAnswer: 1,
  //     explanation:
  //       "The Punchhi Commission (2007) recommended that when a Governor reserves a bill for the President's consideration, the Union Executive should dispose of it within six months.",
  //   },
  //   {
  //     text: "Consider the following organizations/bodies in India:\nI. Central Bureau of Investigation\nII. Central Vigilance Commission\nIII. Enforcement Directorate\n\nHow many of the above bodies/organizations in India were established based on the recommendation of Santhanam Committee?",
  //     options: ["Only one", "Only two", "All the three", "None"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Only two (CBI and CVC) were established based on the Santhanam Committee recommendations. The Enforcement Directorate was established earlier in 1956 under the Department of Economic Affairs.",
  //   },
  //   {
  //     text: "Consider the following:\nI. Comptroller and Auditor General of India (CAG)\nII. Chairman of the Union Public Service Commission (UPSC)\nIII. Chairperson of the National Commission for Women (NCW)\nIV. Chairperson of the National Human Rights Commission (NHRC)\n\nThe salaries and allowances of how many of the above shall be charged upon the Consolidated Fund of India?",
  //     options: ["Only one", "Only two", "Only three", "All the four"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Only two (CAG and UPSC Chairman) have their salaries charged on the CFI. The NCW and NHRC are statutory bodies that receive grants-in-aid from the government; their expenditures are votable and not charged on the CFI.",
  //   },
  //   {
  //     text: "A State legislature introduces a bill that imposes taxes on the consumption of electricity by the Government of India in that State. In this context which statement is correct?",
  //     options: [
  //       "A prior recommendation of the President of India is required for introduction of any such bill.",
  //       "When Parliament by law authorizes the same, only then the State legislature can pass such a bill.",
  //       "Such a bill must be passed by the State legislature by majority of total membership and two-thirds of those present and voting.",
  //       "Such a bill cannot be introduced as electricity consumption tax is a Union List subject.",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "Under Article 287, no State can impose a tax on the consumption of electricity by the Union Government unless the Parliament by law provides otherwise. Electricity tax is Entry 53 of the State List.",
  //   },
  //   {
  //     text: "Consider the following statements regarding Zonal Councils in India:\nI. The idea for establishment of Zonal Council was first mooted by Pt. Jawaharlal Nehru.\nII. In case a Union Territory is a part of a zonal council, two members from such territory is nominated by the President.\nIII. Presently, all states in India are included in the zonal councils.",
  //     options: ["III only", "II only", "I and III", "I and II"],
  //     correctAnswer: 3,
  //     explanation:
  //       "Statements I and II are correct. Statement III is incorrect; the North Eastern states (Assam, Manipur, etc.) are not part of the five Zonal Councils but are covered by the North Eastern Council.",
  //   },
  //   {
  //     text: "With reference to statutory bodies in India, consider the following:\nI. National Commission for Protection of Child Rights\nII. Central Vigilance Commission\nIII. Bar Council of India\nIV. National Human Rights Commission\n\nHow many of the above bodies have the power to take a suo moto cognizance of a matter falling within their functional jurisdiction?",
  //     options: ["Only one", "Only two", "Only three", "All the four"],
  //     correctAnswer: 3,
  //     explanation:
  //       "All four bodies have the authority to act suo motu (initiate proceedings on their own) for matters within their jurisdiction, such as child rights violations, corruption, or human rights abuses.",
  //   },
  //   {
  //     text: "We adopted parliamentary democracy based on the British model, but how does our model differ from that model?\n1. As regards legislation, the British Parliament is supreme or sovereign but in India, the power of the Parliament to legislate is limited.\n2. In India, matters related to the constitutionality of Amendment of an Act of the Parliament are referred to the Constitution Bench by the Supreme Court.",
  //     options: ["1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Both statements are correct. Unlike the sovereign British Parliament, the Indian Parliament's power is limited by a written Constitution and the 'basic structure' doctrine. Constitutional matters are referred to a Constitution Bench (min 5 judges).",
  //   },
  //   {
  //     text: "Which of the following provisions of the Indian Constitution reflect the asymmetric character of India's federal system?\nI. Second Schedule\nII. Fourth Schedule\nIII. Fifth Schedule\nIV. Sixth Schedule",
  //     options: [
  //       "I and II only",
  //       "II, III and IV only",
  //       "III and IV only",
  //       "I, II, III and IV",
  //     ],
  //     correctAnswer: 1,
  //     explanation:
  //       "The Fourth (allocation of RS seats based on population), Fifth (special governance for tribal areas), and Sixth (autonomous councils in the NE) Schedules all represent unequal treatment/powers for different units, defining asymmetric federalism. The Second Schedule is purely administrative.",
  //   },
  //   {
  //     text: "With reference to the Enforcement Directorate, which of the following statements is/are correct?\nI. It is neither a statutory nor a constitutional body.\nII. It functions under the administrative control of the Ministry of Home Affairs.\nIII. It has the authority to declare any individual as a fugitive economic offender under the Fugitive Economic Offenders Act, 2018.",
  //     options: ["I only", "II and III only", "I and III only", "I, II and III"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Statement I is correct (established by executive order). Statement II is incorrect (it is under the Department of Revenue, Ministry of Finance). Statement III is incorrect; the ED can only apply to a Special Court, but the authority to declare someone a fugitive resides with the Court.",
  //   },
  //   {
  //     text: "Consider the following statements in respect of the special provisions for Nagaland under Article 371A:\nI. The President of India has a special responsibility with respect to law and order in the State for as long as internal disturbances continue.\nII. An Act of Parliament relating to ownership and transfer of land and its resources shall not apply to Nagaland unless the Legislative Assembly decides by a resolution.",
  //     options: ["Only 1", "Only II", "Both I and II", "Neither I nor II"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Statement I is incorrect because Article 371A gives this special law-and-order responsibility to the Governor of Nagaland, not the President. Statement II is correct; Parliamentary laws on land ownership don't apply unless the Assembly approves.",
  //   },
  //   {
  //     text: "Consider the following organizations at the State level. The Chairperson of how many shall only be removed from office by the order of the President?\nI. State Public Service Commission\nII. State Finance Commission\nIII. State Election Commission\nIV. State Human Rights Commission",
  //     options: ["Only one", "Only two", "Only three", "All the four"],
  //     correctAnswer: 2,
  //     explanation:
  //       "Three are removed by the President: SPSC (Article 317), State Election Commissioner (Article 243K, like an HC Judge), and SHRC Chairperson (Section 5 of PHRA, 1993). The State Finance Commission's removal is left to State law/Governor.",
  //   },
  //   {
  //     text: "With reference to the seventh schedule, consider the following pairs:\nI. Trade unions - Union List\nII. Population control - Concurrent List\nIII. Public health - State List",
  //     options: ["Only one", "Only two", "All the three", "None"],
  //     correctAnswer: 1,
  //     explanation:
  //       "Only two pairs are correct. Population control (Concurrent) and Public health (State) are correct. Trade unions is in the Concurrent List (Entry 22), not the Union List.",
  //   },
  //   {
  //     text: "As per the Constitution of India, how many of the following functionaries shall hold office during the pleasure of the President?\nI. Attorney General of India\nII. Members of the National Commission for Backward Classes\nIII. Comptroller and Auditor-General of India",
  //     options: ["Only one", "Only two", "All the three", "None"],
  //     correctAnswer: 0,
  //     explanation:
  //       "Only the Attorney General (Article 76(4)) holds office during the pleasure of the President. NCBC members have a fixed three-year term, and the CAG has a fixed six-year term and can only be removed like an SC judge.",
  //   },
  //   {
  //     text: "The Parliament can make laws on matters listed in the State List if the Rajya Sabha passes a resolution. In this context, which statement is correct?",
  //     options: [
  //       "Such a resolution is passed if supported by a majority of members present and voting.",
  //       "Once passed, such a resolution remains in force for a maximum period of six months.",
  //       "This provision does not restrict the power of a state legislature to make laws on the same matter.",
  //       "Laws enacted remain valid after the expiry of the resolution unless repealed by the State Legislature.",
  //     ],
  //     correctAnswer: 2,
  //     explanation:
  //       "Under Article 249, the State Legislature can still make laws on the same matter. However, the Parliamentary law prevails in case of inconsistency. The resolution requires a two-thirds majority (not simple) and lasts for one year (not six months).",
  //   },
  //   {
  //     text: "Which of the following statements is/are correct in respect of the Lokpal in India?\nI. Only a former Chief Justice of India can be appointed as the Chairperson.\nII. The Chairperson can be removed from office only in like manner as a judge of the Supreme Court.\nIII. The Lokpal has jurisdiction to inquire into corruption allegations against the President of India.",
  //     options: ["I and III only", "II only", "I only", "None of the above"],
  //     correctAnswer: 3,
  //     explanation:
  //       "All statements are incorrect. The Chairperson can be a former CJI, SC Judge, or eminent person. Removal follows the Lokpal Act (Presidential order after SC inquiry), not the judge removal process. The President is not under Lokpal jurisdiction.",
  //   },
  //   {
  //     text: "Statement I: The Central Bureau of Investigation (CBI) must obtain the consent of the state government concerned before investigating any offences within the territory of that state.\nStatement II: The subject 'Public order' and 'Police' fall under the State List of the Seventh Schedule of the Constitution of India.",
  //     options: [
  //       "Both Statement I and Statement II are correct and Statement II explains Statement I",
  //       "Both Statement I and Statement II are correct but Statement II does not explain Statement I",
  //       "Statement I is correct but Statement II is not correct",
  //       "Statement I is not correct but Statement II is correct",
  //     ],
  //     correctAnswer: 3,
  //     explanation:
  //       "Statement I is incorrect because while consent is normally required under the DSPE Act, the Supreme Court or High Courts can order a CBI probe without state consent. Statement II is correct; Police and Public Order are State List subjects.",
  //   },
  // ],
  //   "Test-4-Polity (321104)": [
  //   {
  //     "text": "With reference to the writs issued by the Courts in India, consider the following statements:\n1. Mandamus will not lie against a private organisation unless it is entrusted with a public duty.\n2. Mandamus will not lie against a Company even though it may be a Government Company.\n3. Any public minded person can be a petitioner to move the Court to obtain the writ of Quo Warranto.\nWhich of the statements given above are correct?",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "Statement 1 is correct: Mandamus is a command issued to a public official or body to perform official duties. It generally does not lie against a private entity unless it performs a public duty. Statement 2 is correct: It cannot be used against a government company incorporated under the Companies Act as there is no statutory public duty imposed by a statute. Statement 3 is correct: For Quo Warranto, any interested person (not necessarily the aggrieved party) can be the petitioner."
  //   },
  //   {
  //     "text": "With reference to the Supreme Court of India, consider the following statements:\n1. The Indian Constitution provides for a Chief Justice of India and not more than seven other judges until Parliament by law prescribes a larger number.\n2. The judges of the Supreme Court are appointed by the President by warrant under his hand and seal after consultation with such of the Judges of the Supreme Court and of the High Courts in the States as the President may deem necessary.",
  //     "options": [
  //       "1 only",
  //       "2 only",
  //       "Both 1 and 2",
  //       "Neither 1 nor 2"
  //     ],
  //     "correctAnswer": 2,
  //     "explanation": "Statement 1 is correct: Article 124(1) originally specified a Chief Justice and seven other judges, giving Parliament the power to increase this number. Statement 2 is correct: Under Article 124(2), every Judge of the Supreme Court shall be appointed by the President by warrant under his hand and seal after consultation with judges of the Supreme Court and High Courts as deemed necessary."
  //   },
  //   {
  //     "text": "The power of the Supreme Court of India to decide disputes between the Centre and the States falls under its",
  //     "options": [
  //       "Advisory jurisdiction",
  //       "Appellate jurisdiction",
  //       "Original jurisdiction",
  //       "Writ jurisdiction"
  //     ],
  //     "correctAnswer": 2,
  //     "explanation": "The Supreme Court has exclusive original jurisdiction over any dispute between the Government of India and one or more States, or between two or more States. This is provided under Article 131 of the Constitution."
  //   },
  //   {
  //     "text": "Consider the following statements:\n1. A Judge of the Supreme Court can be removed from his office by an order of the President.\n2. The address for removal must be supported by a majority of the total membership of each House and by a majority of not less than two-thirds of the members of that House present and voting.\n3. The grounds for removal are 'proved misbehaviour' or 'incapacity'.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "All statements are correct. A Supreme Court judge can be removed by the President following an address by Parliament. The address must be passed by a special majority (majority of total membership and two-thirds of those present and voting) in each House during the same session. The only two grounds for removal are proved misbehaviour or incapacity."
  //   },
  //   {
  //     "text": "With reference to the 'Curative Petition' in the Supreme Court of India, consider the following statements:\n1. The concept of Curative Petition was evolved by the Supreme Court in the Rupa Ashok Hurra case (2002).\n2. It is the last constitutional resort available for redressal of grievances in court after a review petition is dismissed.\n3. A curative petition can be entertained only if the petitioner establishes that there was a violation of the principles of natural justice.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "Statement 1 is correct: The Supreme Court evolved this concept in 2002 to prevent abuse of its process and cure gross miscarriage of justice. Statement 2 is correct: It is the final legal remedy after a review petition is dismissed. Statement 3 is correct: Grounds for such a petition include violation of natural justice (e.g., the party was not heard) or bias of the judge."
  //   },
  //   {
  //     "text": "Which of the following jurisdictions is shared by both the Supreme Court and the High Courts?",
  //     "options": [
  //       "Advisory jurisdiction",
  //       "Original jurisdiction in Centre-State disputes",
  //       "Writ jurisdiction for enforcement of Fundamental Rights",
  //       "Appellate jurisdiction in all civil cases"
  //     ],
  //     "correctAnswer": 2,
  //     "explanation": "Both the Supreme Court (under Article 32) and the High Courts (under Article 226) have the power to issue writs for the enforcement of Fundamental Rights. Centre-State disputes and advisory jurisdiction are exclusive to the Supreme Court."
  //   },
  //   {
  //     "text": "With reference to the 'Court of Record', consider the following statements:\n1. The judgments of a Court of Record are admitted to be of evidentiary value and cannot be questioned when produced before any court.\n2. Both the Supreme Court and the High Courts are Courts of Record in India.\n3. A Court of Record has the power to punish for contempt of itself.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "All statements are correct. Under Articles 129 (Supreme Court) and 215 (High Courts), these courts are designated as Courts of Record. This means their acts and proceedings are recorded for perpetual memory and testimony and have evidentiary value. They also possess the inherent power to punish for contempt."
  //   },
  //   {
  //     "text": "The 'Basic Structure' doctrine was propounded by the Supreme Court in which of the following cases?",
  //     "options": [
  //       "Golaknath case (1967)",
  //       "Kesavananda Bharati case (1973)",
  //       "Minerva Mills case (1980)",
  //       "Waman Rao case (1981)"
  //     ],
  //     "correctAnswer": 1,
  //     "explanation": "The doctrine of 'Basic Structure' was propounded by the Supreme Court in the Kesavananda Bharati Sripadagalvaru vs. State of Kerala case (1973). The court ruled that while Parliament has wide powers to amend the Constitution, it cannot alter its basic structure or essential features."
  //   },
  //   {
  //     "text": "With reference to the High Courts in India, consider the following statements:\n1. The Constitution does not specify the strength of a High Court and leaves it to the discretion of the President.\n2. The judges of a High Court are appointed by the President after consultation with the Chief Justice of India and the Governor of the State.\n3. A person must have held a judicial office in the territory of India for ten years to be eligible for appointment as a High Court judge.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "Statement 1 is correct: Unlike the Supreme Court, the strength of High Courts is determined by the President from time to time based on workload. Statement 2 is correct: Article 217 provides for the appointment of judges by the President in consultation with the CJI, the State Governor, and (for other than the CJ of the HC) the Chief Justice of that High Court. Statement 3 is correct: Eligibility criteria include 10 years of judicial office or 10 years as an advocate of a High Court."
  //   },
  //   {
  //     "text": "Under the 'Collegium System', the recommendation for the appointment of judges to the Supreme Court is made by a collegium consisting of the Chief Justice of India and",
  //     "options": [
  //       "Two senior-most judges of the Supreme Court",
  //       "Four senior-most judges of the Supreme Court",
  //       "Three senior-most judges of the Supreme Court",
  //       "Five senior-most judges of the Supreme Court"
  //     ],
  //     "correctAnswer": 1,
  //     "explanation": "For Supreme Court appointments, the Collegium consists of the CJI and the four senior-most judges of the Supreme Court. For High Court appointments, the Collegium consists of the CJI and the two senior-most SC judges."
  //   },
  //   {
  //     "text": "The 'Public Interest Litigation' (PIL) in India was introduced through",
  //     "options": [
  //       "A Constitutional Amendment",
  //       "A Parliamentary Statute",
  //       "Judicial Innovation",
  //       "A Presidential Order"
  //     ],
  //     "correctAnswer": 2,
  //     "explanation": "PIL is a product of judicial activism and was introduced by the Supreme Court through judicial innovation (judicial interpretation). It was spearheaded by Justice P.N. Bhagwati and Justice V.R. Krishna Iyer in the late 1970s and early 1980s."
  //   },
  //   {
  //     "text": "With reference to the 'Advisory Jurisdiction' of the Supreme Court (Article 143), consider the following statements:\n1. The President can seek the opinion of the Supreme Court on any question of law or fact of public importance.\n2. The Supreme Court is bound to give its opinion on all matters referred to it by the President.\n3. The opinion expressed by the Supreme Court is binding on the President.",
  //     "options": [
  //       "1 only",
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 0,
  //     "explanation": "Statement 1 is correct: The President may refer a question of law or fact to the Supreme Court. Statement 2 is incorrect: The Court may refuse to give an opinion if the matter involves a question of law/fact of public importance (though it is bound if the matter relates to a pre-constitutional treaty). Statement 3 is incorrect: The opinion is advisory and not binding on the President."
  //   },
  //   {
  //     "text": "The 'Contempt of Court' in India is governed by which of the following?",
  //     "options": [
  //       "Only the Constitution of India",
  //       "Only the Contempt of Courts Act, 1971",
  //       "Both the Constitution and the Contempt of Courts Act, 1971",
  //       "A Presidential Regulation"
  //     ],
  //     "correctAnswer": 2,
  //     "explanation": "Contempt of Court is governed by both the Constitution (Articles 129 and 215) and the Contempt of Courts Act, 1971, which defines civil and criminal contempt."
  //   },
  //   {
  //     "text": "With reference to the 'National Legal Services Authority' (NALSA), consider the following statements:\n1. It was constituted under the Legal Services Authorities Act, 1987 to provide free legal services to the weaker sections of society.\n2. The Chief Justice of India is the Patron-in-Chief of NALSA.\n3. It organizes Lok Adalats for amicable settlement of disputes.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "All statements are correct. NALSA provides free legal aid under the 1987 Act. The CJI is the Patron-in-Chief, and the second senior-most judge of the SC is the Executive Chairman. It also organizes Lok Adalats to reduce the burden on regular courts."
  //   },
  //   {
  //     "text": "The 'Lok Adalats' in India derive their statutory status from",
  //     "options": [
  //       "The Constitution of India",
  //       "The Legal Services Authorities Act, 1987",
  //       "The Civil Procedure Code",
  //       "The Arbitration and Conciliation Act"
  //     ],
  //     "correctAnswer": 1,
  //     "explanation": "Lok Adalats have been given statutory status under the Legal Services Authorities Act, 1987. Under this Act, an award made by a Lok Adalat is deemed to be a decree of a civil court and is final and binding on all parties."
  //   },
  //   {
  //     "text": "Which of the following bodies has the power to recommend the transfer of judges from one High Court to another?",
  //     "options": [
  //       "The President of India alone",
  //       "The Chief Justice of India after consulting the Collegium",
  //       "The Union Law Minister",
  //       "The Governor of the state concerned"
  //     ],
  //     "correctAnswer": 1,
  //     "explanation": "Article 222 provides for the transfer of a judge from one High Court to any other High Court by the President after consultation with the Chief Justice of India. The CJI makes the recommendation after consulting the Collegium (CJI + 4 senior-most judges of SC)."
  //   },
  //   {
  //     "text": "With reference to the 'Gram Nyayalayas', consider the following statements:\n1. They were established under the Gram Nyayalayas Act, 2008 for providing access to justice to citizens at their doorsteps.\n2. A Gram Nyayalaya has both civil and criminal jurisdiction.\n3. The appeals from Gram Nyayalayas in civil cases lie to the District Court.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "All statements are correct. Gram Nyayalayas are mobile courts for rural areas. They exercise both civil and criminal powers. Appeals in criminal cases lie to the Court of Session and in civil cases to the District Court."
  //   },
  //   {
  //     "text": "The 'Judicial Review' power of the Supreme Court of India means the power to",
  //     "options": [
  //       "Review its own judgments",
  //       "Advise the President on legal matters",
  //       "Examine the constitutionality of legislative enactments and executive orders",
  //       "Review the working of the subordinate courts"
  //     ],
  //     "correctAnswer": 2,
  //     "explanation": "Judicial Review is the power of the judiciary to examine the constitutionality of legislative enactments and executive orders of both the Central and State governments. If they are found to be violative of the Constitution, they can be declared as illegal, unconstitutional, and invalid."
  //   },
  //   {
  //     "text": "With reference to the 'Fast Track Courts' (FTCs) in India, consider the following statements:\n1. They were established based on the recommendations of the 11th Finance Commission.\n2. They were primarily set up to dispose of long-pending cases in the sessions courts.\n3. The Central Government provides the entire funding for these courts.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 0,
  //     "explanation": "Statement 1 and 2 are correct. FTCs were recommended by the 11th Finance Commission to clear pendency. Statement 3 is incorrect: after 2011, central funding was stopped for general FTCs, and they are now primarily funded by State governments (though some specific schemes like POSCO FTCs receive central aid)."
  //   },
  //   {
  //     "text": "The concept of 'Justice' (social, economic, and political) mentioned in the Preamble of the Indian Constitution is reinforced by which of the following?",
  //     "options": [
  //       "Fundamental Rights only",
  //       "Directive Principles of State Policy only",
  //       "Both Fundamental Rights and Directive Principles of State Policy",
  //       "Fundamental Duties"
  //     ],
  //     "correctAnswer": 2,
  //     "explanation": "The objective of securing social, economic, and political justice is achieved through the combination of Fundamental Rights (Part III) and Directive Principles of State Policy (Part IV)."
  //   },
  //   {
  //     "text": "With reference to the 'Supreme Court Legal Services Committee', consider the following statements:\n1. It was constituted under the Legal Services Authorities Act, 1987.\n2. It provides free legal aid to persons who are eligible under the Act in cases before the Supreme Court.\n3. The Chairperson of the committee is a sitting Judge of the Supreme Court.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "All statements are correct. The committee ensures legal aid for SC cases. The Chairperson is a sitting SC judge nominated by the CJI."
  //   },
  //   {
  //     "text": "The 'Separation of the Judiciary from the Executive' is mentioned in which Article of the Constitution?",
  //     "options": [
  //       "Article 44",
  //       "Article 48",
  //       "Article 50",
  //       "Article 51"
  //     ],
  //     "correctAnswer": 2,
  //     "explanation": "Article 50 of the Directive Principles of State Policy directs the State to take steps to separate the judiciary from the executive in the public services of the State."
  //   },
  //   {
  //     "text": "With reference to the 'Evening Courts' in India, consider the following statements:\n1. They were introduced to deal with cases involving petty offences like traffic violations and cheque bounce cases.\n2. They help in reducing the huge pendency of cases in the subordinate judiciary.\n3. They are presided over by judicial officers after regular court hours.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "All statements are correct. Evening courts utilize existing infrastructure after hours to handle small cases and reduce the backlog of the judiciary."
  //   },
  //   {
  //     "text": "The 'National Judicial Appointments Commission' (NJAC) Act was declared unconstitutional by the Supreme Court in the",
  //     "options": [
  //       "First Judges case",
  //       "Second Judges case",
  //       "Third Judges case",
  //       "Fourth Judges case"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "The Fourth Judges case (Supreme Court Advocates-on-Record Association vs. Union of India, 2015) declared both the 99th Constitutional Amendment and the NJAC Act as unconstitutional and void, thus reviving the Collegium system."
  //   },
  //   {
  //     "text": "With reference to the 'Amicus Curiae', consider the following statements:\n1. An Amicus Curiae is a person who is not a party to a case but assists the court by offering information or expertise.\n2. The court can appoint an Amicus Curiae on its own motion or on the application of a person.\n3. An Amicus Curiae is paid by the parties to the case.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 0,
  //     "explanation": "Statements 1 and 2 are correct. An Amicus Curiae ('friend of the court') assists in complex cases. Statement 3 is incorrect: they are generally not paid by the parties, and the service is often pro bono or they may receive a token fee from the court."
  //   },
  //   {
  //     "text": "Which of the following is not a ground for the disqualification of a person for appointment as a judge of a High Court?",
  //     "options": [
  //       "If he is not a citizen of India",
  //       "If he has attained the age of 62 years",
  //       "If he has not held a judicial office for at least five years",
  //       "If he is of unsound mind"
  //     ],
  //     "correctAnswer": 2,
  //     "explanation": "To be eligible, a person must have held judicial office for 10 years (not 5). Thus, not holding it for 5 years is not the specific disqualifying threshold; the threshold is 10 years. A person above 62 cannot be appointed as that is the retirement age."
  //   },
  //   {
  //     "text": "With reference to the 'E-Courts' Project, consider the following statements:\n1. It is a Pan-India project monitored and funded by the Department of Justice, Ministry of Law and Justice.\n2. It aims at the ICT enablement of the district and subordinate courts of the country.\n3. It provides services like e-filing, e-payment, and virtual courts.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "All statements are correct. The E-Courts project is a mission-mode project to digitize the judiciary and provide online services to litigants and advocates."
  //   },
  //   {
  //     "text": "The power of 'Suo Motu' cognizance by the Courts in India refers to the power to",
  //     "options": [
  //       "Take up a case on its own motion without a formal complaint",
  //       "Transfer a case from one court to another",
  //       "Review its own judgments",
  //       "Punish for contempt of court"
  //     ],
  //     "correctAnswer": 0,
  //     "explanation": "Suo Motu cognizance refers to the inherent power of the court to initiate legal proceedings on its own, based on news reports, letters, or its own observation of a violation of rights."
  //   },
  //   {
  //     "text": "With reference to the 'Legal Aid Clinics', consider the following statements:\n1. They are established in rural areas, jails, and educational institutions to provide basic legal services.\n2. They are managed by Para-Legal Volunteers (PLVs) and lawyers.\n3. They focus on providing primary legal advice and drafting simple legal documents.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "All statements are correct. Legal Aid Clinics bring legal assistance to the grassroots level, helping those who cannot easily reach District or State Legal Services Authorities."
  //   },
  //   {
  //     "text": "The 'Judicial Activism' in India is closely associated with which of the following?",
  //     "options": [
  //       "Judicial Restraint",
  //       "Public Interest Litigation (PIL)",
  //       "Strict construction of laws",
  //       "Separation of powers"
  //     ],
  //     "correctAnswer": 1,
  //     "explanation": "Judicial activism is the proactive role played by the judiciary in protecting the rights of citizens and promoting justice, primarily through PILs."
  //   },
  //   {
  //     "text": "Which of the following Articles of the Constitution deals with the 'Appellate Jurisdiction' of the Supreme Court in constitutional matters?",
  //     "options": [
  //       "Article 131",
  //       "Article 132",
  //       "Article 133",
  //       "Article 134"
  //     ],
  //     "correctAnswer": 1,
  //     "explanation": "Article 132 deals with the appellate jurisdiction in constitutional cases. Article 133 deals with civil cases, Article 134 with criminal cases, and Article 131 with original jurisdiction."
  //   },
  //   {
  //     "text": "With reference to 'Article 227' of the Constitution, consider the following statements:\n1. It gives the High Court the power of superintendence over all courts and tribunals throughout its territorial jurisdiction.\n2. This power includes both administrative and judicial superintendence.\n3. The High Court can exercise this power suo motu.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "All statements are correct. Article 227 grants High Courts a broad power of superintendence (administrative and judicial) over all subordinate courts and tribunals in their jurisdiction."
  //   },
  //   {
  //     "text": "The 'Acting Chief Justice' of a High Court is appointed by",
  //     "options": [
  //       "The Chief Justice of India",
  //       "The Governor of the State",
  //       "The President of India",
  //       "The senior-most judge of the High Court"
  //     ],
  //     "correctAnswer": 2,
  //     "explanation": "The President can appoint a judge of a High Court as an acting Chief Justice of that court when the office of the Chief Justice is vacant or the Chief Justice is unable to perform his duties."
  //   },
  //   {
  //     "text": "With reference to the 'District Judges', consider the following statements:\n1. They are appointed by the Governor of the State in consultation with the High Court.\n2. A person must have been an advocate for seven years to be eligible for appointment as a district judge.\n3. The term 'District Judge' includes additional district judges and sessions judges.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "All statements are correct under Article 233. District judges are the highest judicial authority in the district, and the term covers various designations like Sessions Judge and Additional District Judge."
  //   },
  //   {
  //     "text": "The power of the Supreme Court to punish for its contempt is provided under which Article?",
  //     "options": [
  //       "Article 124",
  //       "Article 129",
  //       "Article 131",
  //       "Article 136"
  //     ],
  //     "correctAnswer": 1,
  //     "explanation": "Article 129 declares that the Supreme Court shall be a Court of Record and shall have all the powers of such a court including the power to punish for contempt of itself."
  //   },
  //   {
  //     "text": "With reference to 'Article 136' (Special Leave Petition), consider the following statements:\n1. The Supreme Court has the discretion to grant special leave to appeal from any judgment or order in any matter.\n2. This power can be exercised against any court or tribunal in the territory of India, including military tribunals.\n3. It is a plenary power and not a right of the litigant.",
  //     "options": [
  //       "1 only",
  //       "1 and 3 only",
  //       "2 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 1,
  //     "explanation": "Statements 1 and 3 are correct. Article 136 gives the SC wide discretionary (plenary) power. Statement 2 is incorrect because Article 136(2) explicitly excludes judgments or orders passed by any court or tribunal relating to the Armed Forces (military courts/tribunals)."
  //   },
  //   {
  //     "text": "The 'Judicial Standards and Accountability Bill' aims to",
  //     "options": [
  //       "Replace the Collegium system",
  //       "Lay down judicial standards and establish a mechanism for investigating complaints against judges",
  //       "Increase the retirement age of judges",
  //       "Establish a National Judicial Academy"
  //     ],
  //     "correctAnswer": 1,
  //     "explanation": "The bill aims to provide for judicial standards and establish mechanisms for investigating misbehaviour or incapacity of judges of the SC and High Courts."
  //   },
  //   {
  //     "text": "With reference to 'Article 141' of the Constitution, consider the following statements:\n1. The law declared by the Supreme Court shall be binding on all courts within the territory of India.\n2. This includes the Supreme Court itself.\n3. The judgments of the High Courts are not binding on the subordinate courts of other states.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 2,
  //     "explanation": "Statements 1 and 3 are correct. The SC's law is binding on all other courts. Statement 2 is incorrect: the Supreme Court is not bound by its own previous judgments and can depart from them if it finds they were erroneous."
  //   },
  //   {
  //     "text": "The 'Supreme Court of India' was inaugurated on",
  //     "options": [
  //       "15th August, 1947",
  //       "26th November, 1949",
  //       "26th January, 1950",
  //       "28th January, 1950"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "While the Constitution came into effect on 26th Jan 1950, the Supreme Court of India was formally inaugurated on January 28, 1950, succeeding the Federal Court of India."
  //   },
  //   {
  //     "text": "With reference to the 'Permanent Lok Adalats' (PLAs), consider the following statements:\n1. They were established for providing a compulsory pre-litigative mechanism for settlement of disputes related to public utility services.\n2. The pecuniary jurisdiction of a PLA is up to ten lakh rupees.\n3. The award of a Permanent Lok Adalat is final and binding.",
  //     "options": [
  //       "1 and 2 only",
  //       "1 and 3 only",
  //       "2 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 1,
  //     "explanation": "Statements 1 and 3 are correct. PLAs deal with utility services (transport, water, etc.). Statement 2 is incorrect: the pecuniary jurisdiction has been increased to one crore rupees (since 2011)."
  //   },
  //   {
  //     "text": "Which of the following High Courts has the largest territorial jurisdiction in India (excluding UTs)?",
  //     "options": [
  //       "Bombay High Court",
  //       "Calcutta High Court",
  //       "Madras High Court",
  //       "Guwahati High Court"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "The Guwahati High Court originally had jurisdiction over seven states. Even after separate HCs were created for some states, it still serves multiple states (Assam, Nagaland, Mizoram, and Arunachal Pradesh), giving it the largest territorial reach."
  //   },
  //   {
  //     "text": "With reference to the 'National Green Tribunal' (NGT), consider the following statements:\n1. It was established under the National Green Tribunal Act, 2010 for effective disposal of environmental cases.\n2. It is not bound by the procedure laid down under the Code of Civil Procedure, 1908.\n3. It is guided by the principles of natural justice.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "All statements are correct. NGT is a specialized body for environmental disputes, exercising simplified procedures based on natural justice rather than rigid CPC rules."
  //   },
  //   {
  //     "text": "The 'Chief Justice of a High Court' is appointed by the President in consultation with",
  //     "options": [
  //       "The Chief Justice of India and the Governor of the state",
  //       "The Governor of the state and the Collegium",
  //       "The Chief Justice of India, the Governor of the state, and the outgoing Chief Justice",
  //       "The Union Law Minister"
  //     ],
  //     "correctAnswer": 0,
  //     "explanation": "For the appointment of the Chief Justice of a High Court, the President consults the Chief Justice of India and the Governor of the respective state."
  //   },
  //   {
  //     "text": "With reference to the 'Nyaya Panchayats', consider the following statements:\n1. They are the judicial organs of the Panchayati Raj system at the village level.\n2. They deal with petty civil and criminal cases.\n3. They can impose fines but cannot award imprisonment.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "All statements are correct. Nyaya Panchayats provide a forum for local dispute resolution with limited powers, focusing on fines and conciliation rather than incarceration."
  //   },
  //   {
  //     "text": "The power of 'Pardon' in the case of a death sentence is exclusive to",
  //     "options": [
  //       "The Supreme Court",
  //       "The Governor of the state",
  //       "The President of India",
  //       "Both the President and the Governor"
  //     ],
  //     "correctAnswer": 2,
  //     "explanation": "While both the President and the Governor have pardoning powers, only the President has the exclusive power to pardon a death sentence. The Governor can suspend, remit, or commute a death sentence but cannot grant a full pardon for it."
  //   },
  //   {
  //     "text": "With reference to the 'Judicial Academy', consider the following statements:\n1. The National Judicial Academy (NJA) is located in Bhopal.\n2. It provides training to judicial officers of the district and subordinate courts.\n3. It is a registered society fully funded by the Government of India.",
  //     "options": [
  //       "1 and 2 only",
  //       "2 and 3 only",
  //       "1 and 3 only",
  //       "1, 2 and 3"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "All statements are correct. NJA Bhopal is the apex body for judicial training and research in India."
  //   },
  //   {
  //     "text": "The 'Administrative Tribunals' were added to the Constitution by which Amendment?",
  //     "options": [
  //       "42nd Amendment",
  //       "44th Amendment",
  //       "52nd Amendment",
  //       "73rd Amendment"
  //     ],
  //     "correctAnswer": 0,
  //     "explanation": "The 42nd Constitutional Amendment Act of 1976 added Part XIV-A to the Constitution, containing Article 323A (Administrative Tribunals) and Article 323B (Tribunals for other matters)."
  //   },
  //   {
  //     "text": "In the context of the Indian Constitution, the 'Doctrine of Severability' refers to",
  //     "options": [
  //       "Separation of powers",
  //       "The power to declare only the offensive part of a law unconstitutional while keeping the rest valid",
  //       "Independence of the judiciary",
  //       "The process of judge removal"
  //     ],
  //     "correctAnswer": 1,
  //     "explanation": "The Doctrine of Severability (or separability) means that if a law is partly unconstitutional, the court will strike down only the invalid portion if it can be separated from the rest of the law. If the valid and invalid parts are inextricably linked, the whole law is struck down."
  //   },
  //   {
  //     "text": "With reference to Family Courts in India, consider the following statements:\n1. It is mandatory for every State Government to establish a Family Court in every city or town with a population exceeding one million.\n2. The Family Courts in India are not strictly bound by the provisions of Code of Civil Procedure 1908, and have power to make their own rules of procedure to arrive at a settlement.\n3. An appeal from the judgment of a Family Court lies directly to the High Court of the respective state.",
  //     "options": [
  //       "I only",
  //       "I and II only",
  //       "II and III only",
  //       "I, II and III"
  //     ],
  //     "correctAnswer": 3,
  //     "explanation": "All statements are correct. Family Courts focus on conciliation and speedy settlement of matrimonial and family disputes. They follow informal procedures and appeals go to the High Court."
  //   },
  //   {
  //     "text": "In the Supreme Court of India, the term 'Puisne Judges' refers to -",
  //     "options": [
  //       "Judges other than the Chief Justice of India",
  //       "Ad hoc judges appointed by the President of India",
  //       "Retired judges reappointed temporarily under Article 128 of the Constitution of India",
  //       "Chief Justice of India and all the other judges"
  //     ],
  //     "correctAnswer": 0,
  //     "explanation": "The term 'Puisne' means junior or inferior in rank. In legal context, puisne judges refer to all judges of a court other than the Chief Justice. The sanctioned strength of the SC currently is 34 (CJI + 33 puisne judges)."
  //   }
  // ]
  "Test-5-CSAT (322101)": [
    {
      text: "Which of the following statements best reflects the logical inference from the passage given above?\n\nPassage I: Good corporate governance structures encourage companies to provide accountability and control. A fundamental reason why corporate governance has moved onto the economic and political agenda worldwide has been the rapid growth in international capital markets. Effective corporate governance enhances access to external financing by firms, leading to greater investment, higher growth and employment. Investors look to place their funds where the standards of disclosure, of timely and accurate financial reporting, and of equal treatment to all stakeholders are met.",
      options: [
        "It is an important agenda of the countries around the world to ensure access to good external financing.",
        "Good corporate governance improves the credibility of the firms.",
        "International capital markets ensure that the firms maintain good corporate governance.",
        "Good corporate governance paves the way for robust supply chains.",
      ],
      correctAnswer: 1,
      explanation:
        "The passage explains that investors prefer placing funds in companies that meet high standards of disclosure and accurate financial reporting. By providing such accountability and control, good corporate governance enhances a firm's credibility, making it more attractive for external financing and investment.",
    },
    {
      text: "Which of the following, if true, would most appropriately strengthen the author's argument in the passage?\n\nPassage II: The rise of autonomous vehicles has introduced complex questions of legal liability when machine-driven errors cause accidents. Unlike conventional driving, responsibility is no longer limited to human drivers but may extend to software developers, manufacturers, and data providers. While assigning liability to firms could incentivise safer design, it also risks slowing innovation. Conversely, limiting liability may leave victims inadequately compensated. The challenge lies in developing legal frameworks that ensure accountability without discouraging technological progress.",
      options: [
        "Countries that imposed strict liability due to accidents by autonomous vehicles on their manufacturers witnessed a sharp decline in start-ups entering the sector.",
        "Advances in technology have reduced the frequency of software-related driving errors in Autonomous vehicles.",
        "Victims of accidents involving autonomous vehicles often face difficulties in identifying responsible parties under existing laws.",
        "Human error due to non availability of avenues for comprehensive training on driving autonomous vehicles continues to be a major cause of accidents.",
      ],
      correctAnswer: 0,
      explanation:
        "The author argues that assigning liability to firms 'risks slowing innovation.' Option (a) provides a concrete real-world example of this risk by showing that strict liability led to a decline in innovation (start-ups), thereby directly supporting the author's concerns about discouraging technological progress.",
    },
    {
      text: "Which of the following statements represents the most logical and rational inference that can be drawn from the passage?\n\nPassage II: The rise of autonomous vehicles has introduced complex questions of legal liability when machine-driven errors cause accidents. Unlike conventional driving, responsibility is no longer limited to human drivers but may extend to software developers, manufacturers, and data providers. While assigning liability to firms could incentivise safer design, it also risks slowing innovation. Conversely, limiting liability may leave victims inadequately compensated. The challenge lies in developing legal frameworks that ensure accountability without discouraging technological progress.",
      options: [
        "Legal systems must eventually prioritise technological innovation over victim compensation in the case of autonomous vehicles.",
        "Assigning liability in autonomous vehicle accidents requires redefining traditional notions of responsibility beyond individual human agency.",
        "Autonomous vehicle technology is advancing faster than the capacity of law to regulate it effectively.",
        "Strict manufacturer liability is likely to become the dominant global model for regulating autonomous vehicles.",
      ],
      correctAnswer: 1,
      explanation:
        "Traditional liability focuses on the human driver (individual human agency). However, the passage notes that responsibility now extends to technical entities like software developers and data providers. This indicates that legal frameworks must move beyond traditional concepts of individual fault to address systemic and automated errors.",
    },
    {
      text: "Based on the above passage, the following assumptions have been made:\nI. India needs to reform its economic policies to emerge as a global leader.\nII. The process of creative destruction is beneficial for the economy in the long run.\nIII. Despite being drivers of progress, risk taking and innovation are often perceived negatively in society.\nIV. Ease of doing business would aid the process of creative destruction in the economy.\n\nPassage III: Economic ecosystems evolve through a process of 'creative destruction'. The inefficient are weeded out over time and replaced by those that are more competent. Thus, the competitiveness of an economy is critically dependent on its ability to encourage and endure a churn despite all the disruptions it may cause in the short run. However, India exhibits a relatively low level of such dynamism, inconsistent with an economy aspiring to high innovation and risk taking. So what needs to be done? The first step should be to change a deeply ingrained social attitude that looks with suspicion at risk taking and innovation. Second, financial regulations and institutional processes must be reoriented to enable easier entry, exit and reallocation of capital. Third, excessive protection of entrenched incumbents across sectors should be curtailed. Together, these measures can go a long way in fostering greater innovation, adaptability and long term resilience in the Indian economy.",
      options: [
        "I, II and III only",
        "II, III and IV only",
        "II and III only",
        "III and IV only",
      ],
      correctAnswer: 1,
      explanation:
        "Assumption II is supported by the text's claim that creative destruction replaces the inefficient with the competent. Assumption III is supported by the mention of a 'deeply ingrained social attitude' that views risk with suspicion. Assumption IV is supported by the call to reorient processes for 'easier entry, exit and reallocation of capital.' Assumption I is not explicitly made, as the text focuses on 'resilience' rather than 'global leadership.'",
    },
    {
      text: "Which of the following inference(s) can be correctly drawn from the passage given above?\nI. Start-ups derive their competitive advantage largely from their ability to bypass conventional market constraints.\nII. Market disruption driven by start-ups can produce both efficiency gains and systemic risks.\n\nPassage IV: The rapid rise of start-ups has reshaped traditional markets by introducing new business models, technologies, and modes of consumer engagement. By prioritising speed, scalability, and innovation, start-ups often challenge established firms that rely on stability, regulation, and incremental change. While this disruption can increase efficiency and consumer choice, it may also generate uncertainty, job displacement, and regulatory gaps. The resulting tension highlights a broader economic dilemma: how to encourage innovation-driven growth without undermining market stability and long-term institutional resilience.",
      options: ["I only", "II only", "Both I and II", "Neither I nor II"],
      correctAnswer: 2,
      explanation:
        "Inference I is correct as start-ups 'challenge' firms relying on 'stability' and 'regulation.' Inference II is correct as the passage notes disruption 'can increase efficiency' (gains) but 'may also generate uncertainty' and 'regulatory gaps' (risks).",
    },
    {
      text: "Which of the following statements best reflects the most logical, rational and crucial message implied by the passage?\n\nPassage V: Bhopal's \"Kachra Cafe\" is a unique waste management initiative that reimagines waste as a resource. The cafe collects 19 types of waste, including paper, glass, metal, plastic, e-waste, and old clothes. Citizens are encouraged to bring segregated and clean items to the cafe. Each contribution is weighed and converted into digital points, redeemable for snacks or handmade products such as tote bags, envelopes, diyas, and home decor items. The collected waste goes to the municipal corporation's Material Recovery Facilities and is then sent to authorized recyclers, promoting a circular economy. A key feature that makes this initiative unique is the participation of women. Women create and sell snacks and handicrafts made from upcycled materials, turning waste into a livelihood opportunity. As Bhopal aims for increased cleanliness, Kachra Cafe stands out as a replicable, people driven model for sustainability.",
      options: [
        "Waste management practices should be modelled on the principles of circular economy.",
        "Efficient waste management can convert waste into a resource and a livelihood opportunity.",
        "Bhopal's Kachra café model should be replicated for sustainable waste management.",
        "Active participation of communities, especially women, strengthens sustainable development efforts.",
      ],
      correctAnswer: 1,
      explanation:
        "While the passage mentions circular economy and community participation, the most logical and overarching message is how waste can be successfully converted into both a physical 'resource' (upcycled products) and a socioeconomic 'livelihood opportunity' (for women).",
    },
    {
      text: 'Based on the author\'s depiction, the "living ecosystem" view of markets is characterized by:\n\nPassage VI: Beyond spreadsheets and stock tickers, a quiet revolution is unfolding in the heart of capitalism. Environmental, Social, and Governance (ESG) investing is not merely a new metric but a philosophical crossroads, forcing a fundamental question: what is wealth for? It challenges the long-held axiom of profit as a solitary end, proposing instead a vision where capital is a steward for the future. This shift imagines markets not as cold engines of extraction but as living ecosystems where financial return, planetary health, and social equity are intertwined roots of the same tree. The future of capitalism now hangs in the balance-between a legacy defined solely by accumulation and a new destiny written in the language of holistic value.',
      options: [
        "The independent pursuit of financial and social goals.",
        "The intrinsic and inseparable interconnection of various forms of value.",
        "The dominance of natural resource-based industries.",
        "The rapid evolution of financial technologies.",
      ],
      correctAnswer: 1,
      explanation:
        "The passage describes the market as an ecosystem where financial, planetary, and social aspects are 'intertwined roots of the same tree,' implying that they are not independent but are fundamentally and inseparably connected.",
    },
    {
      text: "The vision of capitalism described in the latter part of the passage would be most difficult to realize if:\n\nPassage VI: Beyond spreadsheets and stock tickers, a quiet revolution is unfolding in the heart of capitalism. Environmental, Social, and Governance (ESG) investing is not merely a new metric but a philosophical crossroads, forcing a fundamental question: what is wealth for? It challenges the long-held axiom of profit as a solitary end, proposing instead a vision where capital is a steward for the future. This shift imagines markets not as cold engines of extraction but as living ecosystems where financial return, planetary health, and social equity are intertwined roots of the same tree. The future of capitalism now hangs in the balance-between a legacy defined solely by accumulation and a new destiny written in the language of holistic value.",
      options: [
        "The metrics for measuring planetary health and social equity remain non-financial and qualitative.",
        "Short-term financial performance continues to be the dominant criterion for market success.",
        "New technologies emerge to better track corporate environmental impact.",
        "Public awareness of climate change continues to rise.",
      ],
      correctAnswer: 1,
      explanation:
        "The passage advocates for a move toward 'holistic value' and 'capital as a steward for the future.' This shift would be most difficult if the market remains stuck in the old paradigm of prioritizing 'short-term financial performance' above all other values.",
    },
    {
      text: "Which of the following can be inferred from the passage regarding blockchain's role in supply chains and service delivery?\n\nPassage VII: Blockchain technology is emerging as a powerful tool to enhance transparency and accountability in supply chains. By recording every transaction on an immutable, decentralized ledger, blockchain enables stakeholders to trace goods, payments, and services in real time. This reduces the scope for corruption, fraud, and inefficiency that often plague traditional delivery systems. For instance, in public service delivery, blockchain can ensure that welfare benefits, subsidies, or healthcare services reach the intended recipients without middlemen or data manipulation. Similarly, in commercial supply chains, it improves product authenticity, tracks environmental compliance, and strengthens consumer trust. Therefore, by integrating blockchain into service delivery frameworks, governments and businesses can create systems characterized by greater trust, efficiency, and inclusivity.",
      options: [
        "While it increases operational efficiency, blockchain also raises significant data privacy concerns that limit its adoption by governments.",
        "Blockchain's ability to record transactions in a decentralized and unchangeable manner builds trust among stakeholders by making processes more transparent and traceable.",
        "The primary advantage of blockchain lies in its ability to completely remove human intermediaries from all stages of service and supply chains.",
        "Blockchain technology is more effective in commercial supply chains than in public service delivery frameworks.",
      ],
      correctAnswer: 1,
      explanation:
        "The passage explains that blockchain records transactions on an 'immutable, decentralized ledger,' allowing real-time tracing. This transparency and unchangeable record-keeping are the features that build trust and reduce corruption.",
    },
    {
      text: "Based on the above passage, the following assumptions have been made:\nI. Use of blockchain technology in supply chains would completely eliminate corruption from the system.\nII. Incorporating blockchain into service delivery promotes good governance through greater accountability.\n\nPassage VII: Blockchain technology is emerging as a powerful tool to enhance transparency and accountability in supply chains. By recording every transaction on an immutable, decentralized ledger, blockchain enables stakeholders to trace goods, payments, and services in real time. This reduces the scope for corruption, fraud, and inefficiency that often plague traditional delivery systems. For instance, in public service delivery, blockchain can ensure that welfare benefits, subsidies, or healthcare services reach the intended recipients without middlemen or data manipulation. Similarly, in commercial supply chains, it improves product authenticity, tracks environmental compliance, and strengthens consumer trust. Therefore, by integrating blockchain into service delivery frameworks, governments and businesses can create systems characterized by greater trust, efficiency, and inclusivity.",
      options: ["I only", "II only", "Both I and II", "Neither I nor II"],
      correctAnswer: 1,
      explanation:
        "Assumption II is valid as the text links blockchain to greater accountability and inclusivity. Assumption I is an overstatement; the passage says it 'reduces the scope for corruption,' not that it 'completely eliminates' it.",
    },
    {
      text: "When we meet other people while we travel, we learn to differentiate between:\n\nPassage VIII: Only with long experience and opening of his wares on many a beach where his language is not spoken, will the merchant come to know the worth of what he carries, and what is parochial and what is universal in his choice. Such delicate goods as justice, love and honour, courtesy, and indeed all the things we care for, are valid everywhere but they are variously moulded and often differently handled, and sometimes nearly unrecognizable if you meet them in a foreign land, and the art of learning fundamental common values is perhaps the greatest gain of travel to those who wish to live at ease among their fellows.",
      options: [
        "imagination and understanding",
        "communities and nationalities",
        "local values and universal values",
        "friends and foes",
      ],
      correctAnswer: 2,
      explanation:
        "The passage discusses how travelers learn what is 'parochial' (local/limited) and what is 'universal' by observing how common values like justice and love are 'variously moulded' in different lands.",
    },
    {
      text: "Which of the following statements best reflects the central idea of the passage?\n\nPassage IX: Businesses worldwide are increasingly making ambitious net-zero pledges. While many companies have begun taking meaningful steps toward these commitments, concerns remain due to the prevalence of greenwashing. This has prompted growing demands for stronger standards and greater corporate accountability. Therefore, these pledges must be backed by clear, verifiable transition plans that outline how targets will be achieved. Corporate management should be held accountable for implementing these plans, ensuring measurable progress. Ultimately, genuine sustainability pledges require that corporate promises translate into transparent action and measurable environmental impact.",
      options: [
        "The corporate sector is increasingly committing to environmental sustainability goals.",
        "Greenwashing undermines the credibility and impact of corporate net-zero pledges.",
        "Sustainability pledges are meaningless without transparent action and tangible environmental impact.",
        "While businesses make ambitious sustainability pledges, they often lack a clear roadmap to achieve them.",
      ],
      correctAnswer: 2,
      explanation:
        "The passage argues that pledges are only 'genuine' if they move beyond empty promises to 'transparent action' and 'measurable impact' via 'verifiable transition plans.' This highlights the need for substance over just making pledges.",
    },
    {
      text: "Which one of the following statements most accurately captures the dilemma mentioned by the author of the above passage?\n\nPassage X: Ageing populations pose a complex challenge that goes beyond economics to include health, dignity, and intergenerational equity. While rising life expectancy reflects medical progress, many older adults suffer from chronic illness, disability, and mental health issues, often due to lack of adequate social support. Pension systems, designed for smaller retired populations, are under increasing strain. Encouraging older adults to remain productive may ease fiscal pressure, but unequal health and capacities, and persisting social constraints limit such options. Societies must therefore balance economic sustainability with ethical responsibility, ensuring that pension reforms promote inclusion, autonomy, and well-being rather than treating the elderly solely as economic contributors.",
      options: [
        "Extending the working life of the elderly can resolve the fiscal stress on pension systems.",
        "Rising life expectancy has increased economic pressure on governments without improving social outcomes.",
        "Societies must reconcile the need for sustainable pension systems with ethical obligations towards ageing populations.",
        "Public health interventions are the most critical means and efficient ways to address the challenges of ageing societies.",
      ],
      correctAnswer: 2,
      explanation:
        "The passage describes the 'complex challenge' of balancing fiscal sustainability (pensions) with the 'ethical responsibility' of ensuring health and dignity for a population that cannot always be treated as just 'economic contributors.'",
    },
    {
      text: "Based on the above passage, the following assumptions have been made:\nI. Pension reforms that focus only on fiscal sustainability may undermine the dignity and well-being of the older population.\nII. Not all older people are equally capable of extending their working lives due to health and social constraints.\nIII. Improving public health outcomes among the elderly will resolve most of the financial stress on pension systems.\n\nPassage X: Ageing populations pose a complex challenge that goes beyond economics to include health, dignity, and intergenerational equity. While rising life expectancy reflects medical progress, many older adults suffer from chronic illness, disability, and mental health issues, often due to lack of adequate social support. Pension systems, designed for smaller retired populations, are under increasing strain. Encouraging older adults to remain productive may ease fiscal pressure, but unequal health and capacities, and persisting social constraints limit such options. Societies must therefore balance economic sustainability with ethical responsibility, ensuring that pension reforms promote inclusion, autonomy, and well-being rather than treating the elderly solely as economic contributors.",
      options: ["I and II only", "II only", "I and III only", "I, II and III"],
      correctAnswer: 0,
      explanation:
        "Assumption I is valid because the passage warns against treating the elderly 'solely as economic contributors.' Assumption II is valid as the text mentions 'unequal health and capacities' as a limit. Assumption III is not supported; while health is medical progress, the text says the pension system is strained due to population size changes.",
    },
    {
      text: "Which of the following statements best reflects the central idea of the passage given above?\n\nPassage XI: As the world races to embrace renewable energy, lithium has become an indispensable resource. Lithium-ion batteries are the backbone of this energy transformation, enabling everything from our smartphones to the electric cars that are rapidly becoming commonplace on roads. However, the demand for lithium has significant environmental consequences. Large amounts of water are used in the processing and refining of lithium. Additionally, the mining process often leads to the contamination of local water sources with toxic chemicals. Furthermore, the construction of open-pit mines causes significant land degradation and loss of biodiversity. Also, large piles of crushed rock and mining waste leach harmful chemicals into the surrounding environment, posing long-term risks to the environment. As the demand for lithium continues to grow, it is evident that without more sustainable extraction and processing methods, these environmental impacts will only intensify.",
      options: [
        "The process of extraction and processing of lithium is causing extensive environmental damage.",
        "Lithium is essential for the growth and expansion of the renewable energy sector in an economy.",
        "Along with the expanding lithium's role in renewable energy, its extraction and use must follow sustainable practices to avoid the problem of environmental damage.",
        "Lithium has a wide range of applications and is the backbone of the energy transformation enabling everything from our smartphones to the electric cars.",
      ],
      correctAnswer: 2,
      explanation:
        "The passage outlines that lithium is 'indispensable' for green energy but details its severe environmental costs. It concludes that 'sustainable extraction and processing' are necessary, making (c) the most comprehensive central idea.",
    },
    {
      text: "Based on the above passage, the following assumptions have been made:\nI. The world must explore viable alternatives to lithium, given significant environmental costs.\nII. Current technologies for lithium extraction and use may prove unsustainable in the long term.\n\nPassage XI: As the world races to embrace renewable energy, lithium has become an indispensable resource. Lithium-ion batteries are the backbone of this energy transformation, enabling everything from our smartphones to the electric cars that are rapidly becoming commonplace on roads. However, the demand for lithium has significant environmental consequences. Large amounts of water are used in the processing and refining of lithium. Additionally, the mining process often leads to the contamination of local water sources with toxic chemicals. Furthermore, the construction of open-pit mines causes significant land degradation and loss of biodiversity. Also, large piles of crushed rock and mining waste leach harmful chemicals into the surrounding environment, posing long-term risks to the environment. As the demand for lithium continues to grow, it is evident that without more sustainable extraction and processing methods, these environmental impacts will only intensify.",
      options: ["I only", "II only", "Both I and II", "Neither I nor II"],
      correctAnswer: 1,
      explanation:
        "The passage warns that without 'more sustainable... methods,' environmental impacts will 'intensify,' implying current methods (technologies) are unsustainable long-term. Assumption I is not made; the passage calls for better methods, not necessarily alternatives.",
    },
    {
      text: "Which one of the following statements most accurately captures the central idea of the above passage?\n\nPassage XII: With the increasing role of digital technologies in shaping economic activity, governance, and national security, questions of cybersecurity and digital sovereignty have gained prominence. Much of the internet's core infrastructure such as undersea cables, cloud servers, data centres, and digital platforms is owned or controlled by a small number of private corporations, many of which operate under the legal and regulatory frameworks of foreign countries. While this globally distributed structure has enabled efficiency, innovation, and cross-border connectivity, it also exposes states to vulnerabilities such as data breaches, cyber espionage, and strategic dependence on external legal regimes. In response, governments seek greater control over data flows and digital infrastructure in the name of national security and public interest. However, excessive state control risks fragmenting the internet, limiting innovation, and constraining individual freedoms. The central challenge lies in balancing digital sovereignty with the benefits of an open and interconnected global internet.",
      options: [
        "Governments must prioritise national security over innovation in managing digital infrastructure.",
        "Private corporations should be prevented from controlling critical internet infrastructure.",
        "Asserting digital sovereignty may undermine the openness and efficiency of the global internet.",
        "Cybersecurity risks can be eliminated only through complete state ownership of digital networks.",
      ],
      correctAnswer: 2,
      explanation:
        "The passage explains that asserting 'digital sovereignty' (state control) can lead to internet fragmentation and limited innovation, thereby undermining the benefits of an open global internet. The 'central challenge' is maintaining this balance.",
    },
    {
      text: "Based on the above passage, the following assumptions have been made:\nI. Foreign Legal control over digital infrastructure can create strategic dependencies for states.\nII. Strong cybersecurity can be achieved only by restricting cross-border data flows entirely.\n\nPassage XII: With the increasing role of digital technologies in shaping economic activity, governance, and national security, questions of cybersecurity and digital sovereignty have gained prominence. Much of the internet's core infrastructure such as undersea cables, cloud servers, data centres, and digital platforms is owned or controlled by a small number of private corporations, many of which operate under the legal and regulatory frameworks of foreign countries. While this globally distributed structure has enabled efficiency, innovation, and cross-border connectivity, it also exposes states to vulnerabilities such as data breaches, cyber espionage, and strategic dependence on external legal regimes. In response, governments seek greater control over data flows and digital infrastructure in the name of national security and public interest. However, excessive state control risks fragmenting the internet, limiting innovation, and constraining individual freedoms. The central challenge lies in balancing digital sovereignty with the benefits of an open and interconnected global internet.",
      options: ["I only", "II only", "Both I and II", "Neither I nor II"],
      correctAnswer: 0,
      explanation:
        "Assumption I is valid because the text explicitly states that relying on infrastructure under 'external legal regimes' creates 'strategic dependence.' Assumption II is an absolute claim not supported by the passage, which argues for 'balancing' rather than total restriction.",
    },
    {
      text: 'When does populism become a threat to democracy, according to the passage?\n\nPassage XIII: Populism becomes a threat to democracy when leaders claim to represent the "true will of the people" while undermining institutional checks, independent media, and minority rights. By simplifying complex policy issues into emotionally charged narratives, populist politics often weakens deliberation and delegitimises dissent. Over time, this concentration of authority erodes accountability, replacing democratic pluralism with majoritarian dominance that functions within electoral processes but hollow outs democratic norms.',
      options: [
        "When it prioritises popular welfare schemes over fiscal discipline.",
        "When it mobilises mass support through electoral participation.",
        "When it undermines institutional checks and delegitimises dissent in the name of popular will.",
        "When it appeals emotionally to citizens during election campaigns.",
      ],
      correctAnswer: 2,
      explanation:
        "The passage explicitly states that populism is a threat when it claims to represent the 'true will' to 'undermine institutional checks' and 'delegitimise dissent,' essentially replacing pluralism with unchecked majoritarian dominance.",
    },
    {
      text: "Which of the following statements best reflects the most logical and rational inference that can be made from the passage?\n\nPassage XIV: In today's digital world, the rapid spread of disinformation and misinformation poses a significant and growing threat to the very foundations of democracy. False narratives corrode public trust, as manipulated information can distort perception, spread confusion, and weaken confidence in institutions. This erosion of trust fuels political polarization, social fragmentation, and deepens societal divisions, making constructive dialogue increasingly difficult. Addressing this challenge requires robust regulatory frameworks to limit the circulation of false content and hold actors accountable. Equally important is greater responsibility from social media platforms, which can actively identify, flag, and counter misleading information. Civil society organizations also play a vital role in promoting media literacy, critical thinking, and informed civic engagement. Together, these combined efforts from all can help societies resist manipulation, foster a more informed citizenry, and safeguard democratic integrity.",
      options: [
        "The internet and social media are often exploited to distort public perception and disseminate misinformation.",
        "Constructive dialogue can occur only when it is grounded in social trust.",
        "Failure to ensure accountability contributes to the unchecked spread of false and misleading information.",
        "Tackling disinformation in today's digital word requires a coordinated effort from governments, social media platforms, and civil society organizations.",
      ],
      correctAnswer: 3,
      explanation:
        "The passage identifies the roles of regulators, platforms, and civil society, concluding that 'together, these combined efforts from all' are required. This implies that a coordinated approach across all sectors is the necessary inference.",
    },
    {
      text: "Which of the following statements best reflect the most logical and rational inference/inferences that can be made from the passage?\n1. Central banks cannot bring down inflation without budgetary backing.\n2. The effects of monetary policy depend on the fiscal policies pursued by the government.\n\nPassage XV: As inflation rises, even governments previously committed to budget discipline are spending freely to help households. Higher interest rates announced by central banks are supposed to help produce modest fiscal austerity, because to maintain stable debts while paying more to borrow, governments must cut spending or raise taxes. Without the fiscal backup, monetary policy eventually loses traction. Higher interest rates become inflationary, not disinflationary, because they simply lead governments to borrow more to pay rising debt-service costs. The risk of monetary unmooring is greater when public debt rises, because interest rates become more important to budget deficits.",
      options: ["1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2"],
      correctAnswer: 2,
      explanation:
        "Inference 1 is correct as the text states 'without the fiscal backup, monetary policy eventually loses traction.' Inference 2 is correct because the author argues that fiscal choices (like borrowing more to cover interest) can make monetary policy (interest rate hikes) counter-productive.",
    },
    {
      text: "Based on the above passage, the following assumptions have been made:\n1. Fiscal policies of governments are solely responsible for higher prices.\n2. Higher prices do not affect the long-term government bonds.\n\nPassage XV: As inflation rises, even governments previously committed to budget discipline are spending freely to help households. Higher interest rates announced by central banks are supposed to help produce modest fiscal austerity, because to maintain stable debts while paying more to borrow, governments must cut spending or raise taxes. Without the fiscal backup, monetary policy eventually loses traction. Higher interest rates become inflationary, not disinflationary, because they simply lead governments to borrow more to pay rising debt-service costs. The risk of monetary unmooring is greater when public debt rises, because interest rates become more important to budget deficits.",
      options: ["1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2"],
      correctAnswer: 3,
      explanation:
        "The passage does not state that fiscal policy is 'solely responsible' for inflation; rather, it says fiscal policy determines whether monetary policy is effective in *fighting* it. Assumption 2 is not discussed in the text at all.",
    },
    {
      text: "Based on the passage, the following assumptions has been made:\nI. The benefits of the green transition, such as innovation and sustainable growth, will automatically reach all sections of society.\nII. Socioeconomic inequality influences how different groups experience the shift toward clean energy.\n\nPassage XVI: The shift to clean energy promises security, innovation, and sustainable growth, but carries significant costs that are not borne equally. Existing inequalities mean some individuals and businesses are better positioned to absorb these costs and access new opportunities, while others risk being left behind. This imbalance could deepen societal divides, creating clear winners and losers. Therefore, energy equity-ensuring fair, inclusive, and affordable access to modern clean energy for all-becomes essential to aligning the green transition with social justice and Sustainable Development Goal 7.",
      options: ["I only", "II only", "Both I and II", "Neither I nor II"],
      correctAnswer: 1,
      explanation:
        "Assumption II is valid as the passage states 'existing inequalities' determine who accesses opportunities. Assumption I is incorrect because the passage says some 'risk being left behind,' meaning benefits do not reach everyone automatically.",
    },
    {
      text: "Which of the following statements represents the most logical and rational inference that can be drawn from the passage?\n\nPassage XVII: The growing discourse on de-dollarization reflects deeper shifts in the global financial order. Several countries are exploring trade settlements in local currencies and diversifying foreign exchange reserves to reduce dependence on the US dollar. While this trend signals a move toward a more multipolar financial system, the dollar continues to dominate due to its liquidity, institutional trust, and role in global markets. De-dollarization therefore represents not an abrupt replacement, but a gradual rebalancing shaped by geopolitical considerations, financial stability concerns, and evolving economic alliances.",
      options: [
        "De-dollarization is likely to progress unevenly across countries depending on their geopolitical alignments and financial capacities.",
        "The dominance of the US dollar will persist only until alternative payment systems achieve comparable global liquidity.",
        "A multipolar financial order will reduce the stabilising role traditionally played by the US dollar.",
        "Diversification of reserves signals a deliberate attempt by states to insulate themselves from any dollar-centric risks.",
      ],
      correctAnswer: 0,
      explanation:
        "The passage describes de-dollarization as a 'gradual rebalancing' shaped by 'geopolitical considerations' and 'evolving alliances,' which implies that the process will vary significantly from country to country.",
    },
    {
      text: "As the finance secretary to the Government of India, which of the following would be your suggestion to the Government, considering the perspectives discussed in the passage?\n\nPassage XVII: The growing discourse on de-dollarization reflects deeper shifts in the global financial order. Several countries are exploring trade settlements in local currencies and diversifying foreign exchange reserves to reduce dependence on the US dollar. While this trend signals a move toward a more multipolar financial system, the dollar continues to dominate due to its liquidity, institutional trust, and role in global markets. De-dollarization therefore represents not an abrupt replacement, but a gradual rebalancing shaped by geopolitical considerations, financial stability concerns, and evolving economic alliances.",
      options: [
        "Replace dollar-based trade settlements entirely with rupee-based mechanisms.",
        "Expand rupee-based settlements selectively while continuing dollar-based trade for most transactions.",
        "Avoid rupee-based settlements until the dollar loses its global dominance.",
        "Peg the rupee to another major currency to reduce dollar dependence.",
      ],
      correctAnswer: 1,
      explanation:
        "The text notes the dollar's continued dominance due to liquidity and trust, suggesting de-dollarization is 'gradual.' Thus, a selective expansion of the rupee while maintaining dollar use for the bulk of transactions is the most pragmatic suggestion aligned with the text.",
    },
    {
      text: "Which of the following statements best captures the central idea of the passage?\n\nPassage XVIII: Contemporary debates on sustainable development are increasingly shaped by the contrasting ideas of degrowth and green growth. Degrowth thinkers argue that perpetual economic expansion strains ecological limits and advocate reduced material consumption, particularly in high-income economies. Green growth advocates, however, maintain that innovation, efficiency, and clean technologies can allow economies to grow while lowering environmental impact. Although both perspectives aim to address environmental degradation, they diverge in their assumptions about the desirability of economic growth and the extent to which technology can reconcile growth with sustainability.",
      options: [
        "Degrowth and green growth represent fundamentally opposing responses to environmental degradation, differing mainly in their views on economic growth and technological solutions.",
        "Sustainable development can only be achieved either by limiting consumption or by accelerating technological innovation.",
        "The debate between degrowth and green growth centres on whether sustainability requires redefining economic progress or transforming it through efficiency.",
        "Technological progress is the primary factor distinguishing successful and unsuccessful sustainability strategies.",
      ],
      correctAnswer: 0,
      explanation:
        "The passage contrasts two frameworks and highlights that they 'diverge in their assumptions about the desirability of economic growth' and 'technological reconcilement,' making (a) the most accurate summary of this fundamental opposition.",
    },
    {
      text: "Which of the following statements represents the most logical and rational inference that can be drawn from the passage?\n\nPassage XIX: Migration policy in destination countries is often shaped by the belief that stricter border controls can effectively regulate cross-border movement. Governments tighten entry rules to address security risks, manage fiscal pressures, and respond to domestic political demands. However, experience suggests that migration flows are influenced not only by enforcement, but also by economic incentives, legal pathways, and cooperation with origin countries. This raises an important question: whether policies centred mainly on restriction can manage migration effectively over time, or whether broader policy instruments are necessary.",
      options: [
        "Border control measures of destination countries are ineffective in regulating migration flows in present world due to excessive interdependence and humanitarian obligations of the countries.",
        "Migration governance depends on multiple policy tools taking into account the local needs of the destination countries as well as cooperation with origin countries.",
        "Economic incentives are the primary drivers of international migration from source to destination countries.",
        "Domestic political pressures distorts rational migration policymaking in any country.",
      ],
      correctAnswer: 1,
      explanation:
        "The passage notes that factors like 'economic incentives' and 'cooperation with origin countries' influence flows just as much as enforcement, suggesting that a comprehensive approach ('multiple policy tools') is the logical alternative to just using restriction.",
    },
    {
      text: "Which of the following, if true, would most weaken the argument presented in the passage?\n\nPassage XIX: Migration policy in destination countries is often shaped by the belief that stricter border controls can effectively regulate cross-border movement. Governments tighten entry rules to address security risks, manage fiscal pressures, and respond to domestic political demands. However, experience suggests that migration flows are influenced not only by enforcement, but also by economic incentives, legal pathways, and cooperation with origin countries. This raises an important question: whether policies centred mainly on restriction can manage migration effectively over time, or whether broader policy instruments are necessary.",
      options: [
        "Countries that significantly increased border enforcement experienced sustained decline in irregular migration without expanding legal entry channels.",
        "Migration flows tend to increase during periods of economic growth in destination countries.",
        "Cooperation agreements between origin and destination countries have reduced irregular migration in some regions.",
        "Legal migration pathways reduce incentives for irregular border crossings.",
      ],
      correctAnswer: 0,
      explanation:
        "The author argues that restriction alone might not be enough and that other instruments are likely needed. If countries successfully reduced migration *only* through enforcement without any other tools, it would invalidate the author's claim that enforcement alone is insufficient.",
    },
    {
      text: "Which one of the following statements most accurately captures the dilemma about quiet quitting mentioned by the author of the above passage?\n\nPassage XX: Quiet quitting happens when employees do their jobs to the best of their contractual ability, but nothing beyond that. While quiet quitting is often a personal coping mechanism, it often has ripple effects on organizations. Productivity may shift, team dynamics can change, and morale can be affected when employees withdraw from extra responsibilities creating a conflict between employee's overall wellbeing organizational productivity. However, it isn't inherently a negative trend and can inspire a more conscious approach to workplace culture. Leaders can respond by fostering supportive environments, offering flexibility, and acknowledging employees' contributions. Employees, too, benefit from reflection. Setting boundaries isn't about doing less; it's about doing better with the energy and focus available. Aligning personal values with professional expectations can transform quiet quitting from a silent protest into a strategic approach to sustainable work. Therefore, quiet quitting is steering a larger cultural shift, a re-evaluation of what it means to work, succeed, and live well.",
      options: [
        "Quiet quitting describes the dilemma between personal commitments towards family and professional commitments at the workplace.",
        "Quiet quitting often creates a conflict between employees' overall wellbeing and organizational productivity.",
        "Quiet quitting reflects the tension between employee disengagement and exploitative demand at the workplace.",
        "Quiet quitting highlights the dilemma between profit-driven capitalism and the pursuit of a sustainable work culture.",
      ],
      correctAnswer: 1,
      explanation:
        "The passage identifies the dilemma as employees setting boundaries for their 'wellbeing' which then creates a 'conflict' with the 'productivity' goals of the organization.",
    },
    {
      text: "Based on the above passage, the following assumptions have been made:\nI. Evolution of culture of Quiet quitting is often suggested to be not good for career progression of the employees.\nII. Quiet quitting arose as a reaction to the profit-centric nature of modern capitalism.\n\nPassage XX: Quiet quitting happens when employees do their jobs to the best of their contractual ability, but nothing beyond that. While quiet quitting is often a personal coping mechanism, it often has ripple effects on organizations. Productivity may shift, team dynamics can change, and morale can be affected when employees withdraw from extra responsibilities creating a conflict between employee's overall wellbeing organizational productivity. However, it isn't inherently a negative trend and can inspire a more conscious approach to workplace culture. Leaders can respond by fostering supportive environments, offering flexibility, and acknowledging employees' contributions. Employees, too, benefit from reflection. Setting boundaries isn't about doing less; it's about doing better with the energy and focus available. Aligning personal values with professional expectations can transform quiet quitting from a silent protest into a strategic approach to sustainable work. Therefore, quiet quitting is steering a larger cultural shift, a re-evaluation of what it means to work, succeed, and live well.",
      options: ["I only", "II only", "Both I and II", "Neither I nor II"],
      correctAnswer: 3,
      explanation:
        "The passage describes quiet quitting as a 'personal coping mechanism' and a 're-evaluation of what it means to work,' but it doesn't assume that it hurts career progression (I) or specifically link its origin to a reaction against 'profit-centric capitalism' (II).",
    },
    {
      text: "Based on the above passage, the following assumptions have been made:\n1. Collection, processing and segregation of municipal waste should be with government agencies.\n2. Resource recovery and recycling require technological inputs that can be best handled by private sector enterprises.\n\nPassage XXI: In India, the segregation of municipal waste at source is rare. Recycling is mostly with the informal sector. More than three-fourths of the municipal budget goes into collection and transportation, which leaves very little for processing/resource recovery and disposal. Where does waste-to-energy fit into all this? Ideally it fits in the chain after segregation (between wet waste and the rest), collection, recycling, and before getting to the landfill. Which technology is most appropriate in converting waste to energy depends on what is in the waste (that is biodegradable versus non-biodegradable component) and its calorific value. The biodegradable component of India's municipal solid waste is a little over 50 per cent, and biomethanation offers a major solution for processing this.",
      options: ["1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2"],
      correctAnswer: 3,
      explanation:
        "The passage outlines the budget allocation and technological requirements for waste-to-energy but makes no assumption about whether these tasks *should* be done by the government (1) or the private sector (2).",
    },
    {
      text: "Which one of the following statements best reflects the crux of the passage?\n\nPassage XXI: In India, the segregation of municipal waste at source is rare. Recycling is mostly with the informal sector. More than three-fourths of the municipal budget goes into collection and transportation, which leaves very little for processing/resource recovery and disposal. Where does waste-to-energy fit into all this? Ideally it fits in the chain after segregation (between wet waste and the rest), collection, recycling, and before getting to the landfill. Which technology is most appropriate in converting waste to energy depends on what is in the waste (that is biodegradable versus non-biodegradable component) and its calorific value. The biodegradable component of India's municipal solid waste is a little over 50 per cent, and biomethanation offers a major solution for processing this.",
      options: [
        "Generation of energy from municipal solid waste is inexpensive.",
        "Biomethanation is the most ideal way of generating energy from municipal solid waste.",
        "Segregation of municipal solid waste is the first step in ensuring the success of waste-to-energy plants.",
        "The biodegradable component of India's municipal solid waste is not adequate to provide energy from Waste efficiently/effectively.",
      ],
      correctAnswer: 2,
      explanation:
        "The passage describes the waste management chain and notes that waste-to-energy 'fits in the chain after segregation.' Since technology choice depends on waste components, segregation is the vital 'first step' mentioned in the text.",
    },
    {
      text: "Which of the following statements represents the most logical and rational inference that can be drawn from the passage?\n\nPassage XXII: Advances in space technology have renewed interest in the commercial exploitation of outer space, particularly the mining of asteroids and celestial bodies. While existing international agreements prohibit national sovereignty over outer space, they remain ambiguous on the ownership of extracted resources. While the proponents of the commercial exploitation of outer space argue that commercial ownership rights over the extracted resources are necessary to incentivise private investment and innovation, the critics contend that unregulated commercialization could lead to monopolisation, conflict, and unequal access for all. This raises the fundamental question of how to reconcile commercial activity in space with the principle that outer space is a shared domain of humanity.",
      options: [
        "Commercial space mining is an inevitable reality in the near future, given technological progress.",
        "International space law lacks sufficient clarity on how to regulate the emerging commercial interest in the resource extraction from outer space.",
        "Private investment in commercial exploitation of outer space will undermine international cooperation.",
        "National governments should prohibit private participation in space mining.",
      ],
      correctAnswer: 1,
      explanation:
        "The passage explicitly points out that current agreements are 'ambiguous on the ownership of extracted resources,' supporting the inference that existing laws are not clear enough to regulate commercial extraction.",
    },
    {
      text: "Based on the above passage, the following assumptions have been made:\nI. Clear and commonly accepted rules are necessary to prevent conflict and inequitable outcomes in the commercial exploitation of outer space.\nII. Allowing commercial extraction of space resources is incompatible with the idea of outer space as a shared domain of humanity.\n\nPassage XXII: Advances in space technology have renewed interest in the commercial exploitation of outer space, particularly the mining of asteroids and celestial bodies. While existing international agreements prohibit national sovereignty over outer space, they remain ambiguous on the ownership of extracted resources. While the proponents of the commercial exploitation of outer space argue that commercial ownership rights over the extracted resources are necessary to incentivise private investment and innovation, the critics contend that unregulated commercialization could lead to monopolisation, conflict, and unequal access for all. This raises the fundamental question of how to reconcile commercial activity in space with the principle that outer space is a shared domain of humanity.",
      options: ["I only", "II only", "Both I and II", "Neither I nor II"],
      correctAnswer: 0,
      explanation:
        "Assumption I is valid because the text mentions that 'unregulated' activity could lead to 'conflict' and 'unequal access.' Assumption II is not made; rather, it is presented as a 'fundamental question' of how to 'reconcile' the two, not a settled incompatibility.",
    },
    {
      text: "As the chairman of the committee what would be your advice to the government, keeping in mind the perspective presented in the passage?\n\nPassage XXIII: Advances in genetic editing technologies such as CRISPR have expanded the ability to alter human, animal, and plant genomes with unprecedented precision. While these tools hold promise for treating genetic diseases and improving food security, they also raise ethical concerns about unintended consequences, unequal access, and the limits of human intervention in biological processes. As scientific capability advances faster than regulatory consensus, societies face the challenge of determining how innovation can proceed responsibly without eroding ethical safeguards or public trust.",
      options: [
        "Approve unrestricted clinical use to avoid delaying scientific progress.",
        "Prohibit all clinical applications until comprehensive international regulations are established.",
        "Allow controlled clinical trials under strict ethical oversight and make provision for a periodic review.",
        "To take suggestions from a group of international scientists who are specialist in the matter and then arrive at a decision.",
      ],
      correctAnswer: 2,
      explanation:
        "The passage argues for innovation to 'proceed responsibly' without eroding 'ethical safeguards.' A controlled trial with strict oversight and periodic reviews provides a way to advance science while managing the ethical and safety risks highlighted.",
    },
    {
      text: "Based on the above passage, the following assumptions have been made:\nI. Governments must regulate genetic editing to ensure its safe and ethical use.\nII. Developing humans with desired traits through genetic editing could disrupt the course of natural evolution.\n\nPassage XXIII: Advances in genetic editing technologies such as CRISPR have expanded the ability to alter human, animal, and plant genomes with unprecedented precision. While these tools hold promise for treating genetic diseases and improving food security, they also raise ethical concerns about unintended consequences, unequal access, and the limits of human intervention in biological processes. As scientific capability advances faster than regulatory consensus, societies face the challenge of determining how innovation can proceed responsibly without eroding ethical safeguards or public trust.",
      options: ["I only", "II only", "Both I and II", "Neither I nor II"],
      correctAnswer: 2,
      explanation:
        "Assumption I is valid as the text mentions the 'challenge' of determining how to proceed responsibly (regulatory consensus). Assumption II is valid as it falls under the 'ethical concerns' about the 'limits of human intervention in biological processes' mentioned in the text.",
    },
    {
      text: "Based on the above passage, the following assumptions have been made:\nI. As central banks across the world adopt CBDCs, the use of crypto assets would decline.\nII. The rise of CBDCs may accelerate the growth of digital finance and strengthen the digital economy.\n\nPassage XXIV: Central Bank Digital Currencies (CBDCs) blend the convenience of digital payments with state-backed trust. As central banks worldwide explore CBDCs, their emergence could reshape the global financial landscape and crypto regulation. One possibility is that CBDCs will prompt governments to impose stricter controls on decentralized cryptocurrencies to preserve monetary authority and prevent illicit activities. Increased oversight of crypto exchanges and transactions may follow. Conversely, CBDCs might legitimize and accelerate the acceptance of digital assets by familiarizing the public with digital finance. This could encourage regulators to adopt a balanced framework that promotes innovation while ensuring financial stability and consumer protection in the expanding digital economy.",
      options: ["I only", "II only", "Both I and II", "Neither I nor II"],
      correctAnswer: 1,
      explanation:
        "The passage explicitly suggests CBDCs could 'accelerate the acceptance of digital assets' and 'strengthen the digital economy' (II). However, it also suggests they could *legitimize* digital assets, so a 'decline' (I) is not a stated assumption.",
    },
    {
      text: "Based on the above passage, the following assumptions have been made:\nI. Homogenization through globalization is eroding the diverse cultural heritage of communities.\nII. Preserving intangible cultural heritage is essential to safeguard the living traditions of humankind.\n\nPassage XXV: Cultural heritage does not end at monuments and collections of objects. It also includes the intangible cultural heritage comprising of traditions or living expressions inherited from our ancestors and passed on to our descendants. These include oral traditions, performing arts, social practices, rituals, festive events, knowledge and practices concerning nature and the skills to produce traditional crafts. Rooted in inclusivity and representativeness, the intangible heritage fosters a shared sense of identity and belonging within communities. It is an important factor in maintaining cultural diversity in the face of growing globalization. An understanding of the intangible cultural heritage of different communities therefore helps with intercultural dialogue, and encourages mutual respect for varied ways of life.",
      options: ["I only", "II only", "Both I and II", "Neither I nor II"],
      correctAnswer: 2,
      explanation:
        "The passage describes intangible heritage as a factor in 'maintaining diversity' against 'growing globalization' (Assumption I) and defines it as 'living expressions... passed on to our descendants,' making its preservation essential (Assumption II).",
    },
    {
      text: "What can be inferred about the broader societal impact, as suggested by the final lines of the passage?\n\nPassage XXVI: In hopeful queues, India's youth waits-not for change, but for a hallowed government desk. Dreams shrink into answer sheets, time turns into endless preparation, and the heart learns the grammar of patience and panic. Every rank announced is a verdict on worth; every withheld roll number, a quiet corrosion of trust. What grows in this long season of waiting? Not fields, not workshops, not new ideas, not creativity; only a generation trained in the delicate art of hoping softly, while the system measures merit in marks and endless delays.",
      options: [
        "It leads to a lack of highly skilled professionals in the private sector in the country.",
        "It results in the systematic stifling of economic and creative productivity.",
        "It ensures a fair and transparent and effective selection of the most capable administrators.",
        "It strengthens the youth's faith in institutional processes and outcomes.",
      ],
      correctAnswer: 1,
      explanation:
        "The passage concludes by stating that 'not fields, not workshops, not new ideas, not creativity' grow during this period. This implies a systematic lack of real-world economic and creative output because the youth are focused purely on the 'grammar of patience' for exams.",
    },
    {
      text: "Which of the following statements best captures the central idea of the passage?\n\nPassage XXVI: In hopeful queues, India's youth waits-not for change, but for a hallowed government desk. Dreams shrink into answer sheets, time turns into endless preparation, and the heart learns the grammar of patience and panic. Every rank announced is a verdict on worth; every withheld roll number, a quiet corrosion of trust. What grows in this long season of waiting? Not fields, not workshops, not new ideas, not creativity; only a generation trained in the delicate art of hoping softly, while the system measures merit in marks and endless delays.",
      options: [
        "The protracted pursuit of government employment is extracting a heavy socio-psychological toll on Indian youth and the nation's broader potential.",
        "The intense competition for government jobs in India is a necessary filter to ensure only the most dedicated candidates enter public service.",
        "India's youth are increasingly disillusioned with the private sector, leading them to seek meaning and security in stable government careers.",
        "The examination system for government jobs, while stressful, is a fair and transparent mechanism that upholds the principle of meritocracy.",
      ],
      correctAnswer: 0,
      explanation:
        "The entire passage describes the 'shrinking' of dreams and 'corrosion of trust' as youth wait years for government jobs. It emphasizes the loss of creative and economic potential, making (a) the most accurate capture of this heavy toll on both individuals and the nation.",
    },
  ],
};

module.exports = sfgData;

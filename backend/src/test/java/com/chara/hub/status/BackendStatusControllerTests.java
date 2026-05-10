package com.chara.hub.status;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(BackendStatusController.class)
class BackendStatusControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void statusDescribesPassiveBackendMode() throws Exception {
		mockMvc.perform(get("/api/status"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.service").value("chara-hub-api"))
				.andExpect(jsonPath("$.mode").value("passive"))
				.andExpect(jsonPath("$.ownsUserDataFlow").value(false))
				.andExpect(jsonPath("$.activationCriteria[0]").value("JWT validation"))
				.andExpect(jsonPath("$.boundaries[0]", containsString("service role keys")));
	}

	@Test
	void statusAllowsLocalFrontendDevelopmentOrigin() throws Exception {
		mockMvc.perform(get("/api/status")
				.header("Origin", "http://localhost:4200"))
				.andExpect(status().isOk())
				.andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));
	}
}

package com.edutech.config;

import com.edutech.service.UserService;
import com.edutech.util.JwtRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

        @Autowired
        private UserService userService;

        @Autowired
        private JwtRequestFilter jwtRequestFilter;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Override
        protected void configure(AuthenticationManagerBuilder auth) throws Exception {
                auth.userDetailsService(userService).passwordEncoder(passwordEncoder);
        }

        @Override
        protected void configure(HttpSecurity http) throws Exception {
                http
                                .csrf().disable()
                                .authorizeRequests()

                                // Public authentication APIs
                                .antMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                                .antMatchers(HttpMethod.POST, "/api/auth/register/initiate").permitAll()
                                .antMatchers(HttpMethod.POST, "/api/auth/register/verify-otp").permitAll()
                                .antMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                                .antMatchers(HttpMethod.POST, "/api/auth/forgot-password").permitAll()
                                .antMatchers(HttpMethod.POST, "/api/auth/forgot-password/verify-otp").permitAll()
                                .antMatchers(HttpMethod.POST, "/api/auth/reset-password").permitAll()
                                .antMatchers(HttpMethod.POST, "/api/auth/google").permitAll()
                                .antMatchers(HttpMethod.POST, "/api/auth/google/complete").permitAll()

                                // Subscription APIs - authenticated
                                .antMatchers(HttpMethod.POST, "/api/subscription/**").authenticated()
                                .antMatchers(HttpMethod.GET, "/api/subscription/status/**").authenticated()

                                // Auth APIs with token
                                .antMatchers(HttpMethod.GET, "/api/auth").authenticated()
                                .antMatchers(HttpMethod.GET, "/api/auth/user/**").authenticated()
                                .antMatchers(HttpMethod.PUT, "/api/auth/user/**").authenticated()
                                .antMatchers(HttpMethod.DELETE, "/api/auth/user/**")
                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                                // Job APIs
                                .antMatchers(HttpMethod.GET, "/api/jobs/**")
                                .hasAnyAuthority(
                                                "CLIENT", "FREELANCER", "ADMIN",
                                                "ROLE_CLIENT", "ROLE_FREELANCER", "ROLE_ADMIN")

                                .antMatchers(HttpMethod.POST, "/api/jobs/*/apply")
                                .hasAnyAuthority("FREELANCER", "ROLE_FREELANCER")

                                .antMatchers(HttpMethod.POST, "/api/jobs/**")
                                .hasAnyAuthority(
                                                "CLIENT", "FREELANCER",
                                                "ROLE_CLIENT", "ROLE_FREELANCER")

                                .antMatchers(HttpMethod.PUT, "/api/jobs/**")
                                .hasAnyAuthority("CLIENT", "ROLE_CLIENT")

                                .antMatchers(HttpMethod.DELETE, "/api/jobs/**")
                                .hasAnyAuthority(
                                                "ADMIN", "CLIENT",
                                                "ROLE_ADMIN", "ROLE_CLIENT")

                                // Proposal APIs
                                .antMatchers(HttpMethod.GET, "/api/proposals/myProposal")
                                .hasAnyAuthority("FREELANCER", "ROLE_FREELANCER")

                                .antMatchers(HttpMethod.GET, "/api/proposals/myPropsal")
                                .hasAnyAuthority("FREELANCER", "ROLE_FREELANCER")

                                .antMatchers(HttpMethod.GET, "/api/proposals/job/**")
                                .hasAnyAuthority(
                                                "CLIENT", "ADMIN",
                                                "ROLE_CLIENT", "ROLE_ADMIN")

                                .antMatchers(HttpMethod.GET, "/api/proposals").denyAll()
                                .antMatchers(HttpMethod.GET, "/api/proposals/*").denyAll()

                                .antMatchers(HttpMethod.POST, "/api/proposals/**")
                                .hasAnyAuthority(
                                                "CLIENT", "FREELANCER",
                                                "ROLE_CLIENT", "ROLE_FREELANCER")

                                .antMatchers(HttpMethod.PUT, "/api/proposals/**")
                                .hasAnyAuthority(
                                                "CLIENT", "FREELANCER",
                                                "ROLE_CLIENT", "ROLE_FREELANCER")

                                .antMatchers(HttpMethod.DELETE, "/api/proposals/**")
                                .hasAnyAuthority(
                                                "CLIENT", "FREELANCER", "ADMIN",
                                                "ROLE_CLIENT", "ROLE_FREELANCER", "ROLE_ADMIN")

                                // Freelancer Profile APIs
                                .antMatchers(HttpMethod.GET, "/api/freelancer-profile/**")
                                .hasAnyAuthority(
                                                "CLIENT", "FREELANCER", "ADMIN",
                                                "ROLE_CLIENT", "ROLE_FREELANCER", "ROLE_ADMIN")

                                .antMatchers(HttpMethod.POST, "/api/freelancer-profile/**")
                                .hasAnyAuthority("FREELANCER", "ROLE_FREELANCER")

                                // Admin-only APIs — analytics and monitoring
                                .antMatchers("/api/admin/**")
                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                                .anyRequest().authenticated()

                                .and()
                                .sessionManagement()
                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);

                http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        }

        @Bean
        @Override
        public AuthenticationManager authenticationManagerBean() throws Exception {
                return super.authenticationManagerBean();
        }
}

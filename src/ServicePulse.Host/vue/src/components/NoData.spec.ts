import { expect, it, render, screen } from "../../test/utils";

import HelloWorld from "./NoData.vue";

it('should work',async()=>{
    render(HelloWorld, { props: { message:'Hello!'} });
    expect(await screen.findByText('Hello!')).toBeVisible();
});